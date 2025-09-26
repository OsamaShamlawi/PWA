import express from "express";
import sqlite3 from "sqlite3";
import { authenticateToken } from "./auth.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const dbPath = join(__dirname, '..', 'finance.db');
const db = new sqlite3.Database(dbPath);

// Get all credit cards for user
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    "SELECT id, cardName, lastFourDigits, cardType, expiryMonth, expiryYear, creditLimit, currentBalance, isActive, createdAt FROM credit_cards WHERE userId = ? AND isActive = 1 ORDER BY createdAt DESC",
    [userId],
    (err, cards) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ cards });
    }
  );
});

// Add new credit card
router.post("/", authenticateToken, (req, res) => {
  const { cardName, lastFourDigits, cardType, expiryMonth, expiryYear, creditLimit } = req.body;
  const userId = req.user.id;
  
  if (!cardName || !lastFourDigits || !cardType || !expiryMonth || !expiryYear) {
    return res.status(400).json({ error: "All card details are required" });
  }
  
  if (lastFourDigits.length !== 4 || !/^\d{4}$/.test(lastFourDigits)) {
    return res.status(400).json({ error: "Last four digits must be exactly 4 numbers" });
  }
  
  db.run(
    "INSERT INTO credit_cards (userId, cardName, lastFourDigits, cardType, expiryMonth, expiryYear, creditLimit) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [userId, cardName, lastFourDigits, cardType, expiryMonth, expiryYear, creditLimit || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: "Failed to add credit card" });
      }
      res.status(201).json({ 
        message: "Credit card added successfully",
        cardId: this.lastID
      });
    }
  );
});

// Update credit card
router.put("/:cardId", authenticateToken, (req, res) => {
  const { cardId } = req.params;
  const { cardName, expiryMonth, expiryYear, creditLimit } = req.body;
  const userId = req.user.id;
  
  db.run(
    "UPDATE credit_cards SET cardName = ?, expiryMonth = ?, expiryYear = ?, creditLimit = ? WHERE id = ? AND userId = ?",
    [cardName, expiryMonth, expiryYear, creditLimit, cardId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Credit card not found" });
      }
      res.json({ message: "Credit card updated successfully" });
    }
  );
});

// Delete credit card (soft delete)
router.delete("/:cardId", authenticateToken, (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;
  
  db.run(
    "UPDATE credit_cards SET isActive = 0 WHERE id = ? AND userId = ?",
    [cardId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Credit card not found" });
      }
      res.json({ message: "Credit card removed successfully" });
    }
  );
});

// Add transaction
router.post("/:cardId/transactions", authenticateToken, (req, res) => {
  const { cardId } = req.params;
  const { amount, description, category, transactionDate } = req.body;
  const userId = req.user.id;
  
  if (!amount || !description || !category || !transactionDate) {
    return res.status(400).json({ error: "All transaction details are required" });
  }
  
  // Verify card belongs to user
  db.get(
    "SELECT id FROM credit_cards WHERE id = ? AND userId = ? AND isActive = 1",
    [cardId, userId],
    (err, card) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (!card) {
        return res.status(404).json({ error: "Credit card not found" });
      }
      
      // Add transaction
      db.run(
        "INSERT INTO transactions (userId, cardId, amount, description, category, transactionDate) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, cardId, amount, description, category, transactionDate],
        function(err) {
          if (err) {
            return res.status(500).json({ error: "Failed to add transaction" });
          }
          
          // Update card balance
          db.run(
            "UPDATE credit_cards SET currentBalance = currentBalance + ? WHERE id = ?",
            [amount, cardId],
            (err) => {
              if (err) {
                console.error("Failed to update card balance:", err);
              }
            }
          );
          
          res.status(201).json({ 
            message: "Transaction added successfully",
            transactionId: this.lastID
          });
        }
      );
    }
  );
});

// Get transactions for user or specific card
router.get("/transactions", authenticateToken, (req, res) => {
  const { cardId, category, startDate, endDate } = req.query;
  const userId = req.user.id;
  
  let query = `
    SELECT t.*, c.cardName, c.lastFourDigits 
    FROM transactions t 
    LEFT JOIN credit_cards c ON t.cardId = c.id 
    WHERE t.userId = ?
  `;
  let params = [userId];
  
  if (cardId) {
    query += " AND t.cardId = ?";
    params.push(cardId);
  }
  
  if (category) {
    query += " AND t.category = ?";
    params.push(category);
  }
  
  if (startDate) {
    query += " AND t.transactionDate >= ?";
    params.push(startDate);
  }
  
  if (endDate) {
    query += " AND t.transactionDate <= ?";
    params.push(endDate);
  }
  
  query += " ORDER BY t.transactionDate DESC, t.createdAt DESC";
  
  db.all(query, params, (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ transactions });
  });
});

// Get spending summary
router.get("/spending-summary", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { period = "month" } = req.query; // month, week, year
  
  let dateCondition;
  switch (period) {
    case "week":
      dateCondition = "AND t.transactionDate >= date('now', '-7 days')";
      break;
    case "year":
      dateCondition = "AND t.transactionDate >= date('now', '-1 year')";
      break;
    default: // month
      dateCondition = "AND t.transactionDate >= date('now', '-1 month')";
  }
  
  // Get spending by category
  db.all(`
    SELECT 
      t.category,
      COUNT(*) as transactionCount,
      SUM(t.amount) as totalAmount,
      AVG(t.amount) as averageAmount
    FROM transactions t
    WHERE t.userId = ? ${dateCondition}
    GROUP BY t.category
    ORDER BY totalAmount DESC
  `, [userId], (err, categorySpending) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    
    // Get total spending
    db.get(`
      SELECT 
        COUNT(*) as totalTransactions,
        SUM(amount) as totalSpending
      FROM transactions 
      WHERE userId = ? ${dateCondition}
    `, [userId], (err, totalSpending) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({
        period,
        totalSpending: totalSpending.totalSpending || 0,
        totalTransactions: totalSpending.totalTransactions || 0,
        categoryBreakdown: categorySpending
      });
    });
  });
});

export default router;
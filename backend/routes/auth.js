import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const dbPath = join(__dirname, '..', 'finance.db');
const db = new sqlite3.Database(dbPath);

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        "INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, firstName || null, lastName || null],
        function(err) {
          if (err) {
            return res.status(500).json({ error: "Failed to create user" });
          }
          
          const token = jwt.sign({ id: this.lastID, email }, process.env.JWT_SECRET, { expiresIn: "24h" });
          res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: { id: this.lastID, email, firstName, lastName }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
      res.json({ 
        message: "Login successful",
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, (req, res) => {
  db.get("SELECT id, email, firstName, lastName, createdAt FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  });
});

export default router;

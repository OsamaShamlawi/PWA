import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import sqlite3 from "sqlite3";
import { authenticateToken } from "./auth.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const dbPath = join(__dirname, '..', 'finance.db');
const db = new sqlite3.Database(dbPath);

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder_key') {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI client initialized - Full access enabled');
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client:', error.message);
  }
} else {
  console.log('⚠️ OpenAI client not initialized - running in demo mode');
}

// Send message to chatbot
router.post("/", authenticateToken, async (req, res) => {
  let currentSessionId = null;
  
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;
    
    console.log(`📨 Chatbot request from user ${userId}: "${message.substring(0, 50)}..."`);
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Create new session if not provided
    currentSessionId = sessionId;
    if (!currentSessionId) {
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO chat_sessions (userId, title) VALUES (?, ?)",
          [userId, message.substring(0, 50) + "..."],
          function(err) {
            if (err) reject(err);
            else {
              currentSessionId = this.lastID;
              resolve();
            }
          }
        );
      });
    }

    // Save user message
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO chat_messages (sessionId, role, content) VALUES (?, ?, ?)",
        [currentSessionId, "user", message],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Get chat history for context
    const chatHistory = await new Promise((resolve, reject) => {
      db.all(
        "SELECT role, content FROM chat_messages WHERE sessionId = ? ORDER BY timestamp ASC LIMIT 10",
        [currentSessionId],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    // Prepare messages for OpenAI
    const messages = [
      { 
        role: "system", 
        content: "You are a helpful financial advisor AI assistant. Provide personalized advice on saving, investing, budgeting, debt management, and retirement planning. Be concise but thorough in your responses. Use emojis when appropriate to make the conversation friendly." 
      },
      ...chatHistory.map(msg => ({ role: msg.role === "bot" ? "assistant" : msg.role, content: msg.content }))
    ];

    let botReply;
    
    if (!openai) {
      // Demo mode response
      botReply = "🤖 Demo Mode: I'm your AI financial advisor! To enable real AI responses, please configure your OPENAI_API_KEY. For now, here's some general financial advice based on your question:\n\n" +
        "• Consider diversifying your investments across different asset classes\n" +
        "• Build an emergency fund with 3-6 months of expenses\n" +
        "• Pay off high-interest debt before investing\n" +
        "• Start saving for retirement early to benefit from compound interest\n\n" +
        "What specific financial topic would you like to explore further?";
    } else {
      console.log(`🤖 Making OpenAI API call with ${messages.length} messages`);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      botReply = response.choices[0].message.content;
      console.log(`✅ OpenAI response received: "${botReply.substring(0, 50)}..."`);
    }

    // Save bot response
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO chat_messages (sessionId, role, content) VALUES (?, ?, ?)",
        [currentSessionId, "bot", botReply],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({ 
      reply: botReply,
      sessionId: currentSessionId
    });

  } catch (err) {
    console.error("Chatbot error details:", {
      message: err.message,
      status: err.status,
      type: err.type,
      stack: err.stack
    });
    
    // More specific error handling
    if (err.status === 401) {
      res.status(401).json({ error: "OpenAI API authentication failed" });
    } else if (err.status === 429) {
      // Quota exceeded - fallback to demo mode response
      const fallbackReply = "🚫 **API Quota Exceeded**: Your OpenAI API quota has been reached. Please check your billing details at platform.openai.com.\n\n" +
        "💡 Here's some general financial advice for your question:\n\n" +
        "**Debt vs Investment Priority:**\n" +
        "• Pay off high-interest debt first (credit cards >6% APR)\n" +
        "• Build emergency fund (3-6 months expenses)\n" +
        "• Invest once you have stable foundation\n" +
        "• Consider debt avalanche method for multiple debts\n\n" +
        "Would you like more specific guidance on debt management strategies?";
      
      res.json({ reply: fallbackReply, sessionId: currentSessionId });
      return;
    } else if (err.status === 400) {
      res.status(400).json({ error: "Invalid request to OpenAI API" });
    } else {
      res.status(500).json({ 
        error: "Failed to process message", 
        details: process.env.NODE_ENV === 'development' ? err.message : undefined 
      });
    }
  }
});

// Get chat sessions for user
router.get("/sessions", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    "SELECT id, title, createdAt, updatedAt FROM chat_sessions WHERE userId = ? ORDER BY updatedAt DESC",
    [userId],
    (err, sessions) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ sessions });
    }
  );
});

// Get messages for a specific session
router.get("/sessions/:sessionId", authenticateToken, (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  
  // Verify session belongs to user
  db.get(
    "SELECT id FROM chat_sessions WHERE id = ? AND userId = ?",
    [sessionId, userId],
    (err, session) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Get messages
      db.all(
        "SELECT role, content, timestamp FROM chat_messages WHERE sessionId = ? ORDER BY timestamp ASC",
        [sessionId],
        (err, messages) => {
          if (err) {
            return res.status(500).json({ error: "Database error" });
          }
          res.json({ messages });
        }
      );
    }
  );
});

// Delete a chat session
router.delete("/sessions/:sessionId", authenticateToken, (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  
  db.run(
    "DELETE FROM chat_sessions WHERE id = ? AND userId = ?",
    [sessionId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ message: "Session deleted successfully" });
    }
  );
});

// Test endpoint to verify OpenAI API key
router.get("/test", async (req, res) => {
  try {
    if (!openai) {
      return res.json({ status: "demo_mode", message: "OpenAI client not initialized" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say 'Hello! API is working.'" }],
      max_tokens: 10
    });

    res.json({ 
      status: "success", 
      message: "OpenAI API is working",
      response: response.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      type: error.type,
      status: error.status 
    });
  }
});

export default router;

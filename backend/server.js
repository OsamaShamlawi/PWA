import dotenv from "dotenv";

// Load environment variables FIRST before importing other modules
dotenv.config();



import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import chatbotRoutes from "./routes/chatbot.js";
import creditCardRoutes from "./routes/creditcards.js";
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/creditcards", creditCardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} and accessible on network`));

import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import itemsRouter from "./routes/items"; // Import routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());

// Connect to MongoDB
const client = new MongoClient(MONGO_URI);
let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db("shop");
    console.log("Connected to MongoDB");

    // Initialize items collection
    const itemsCollection = db.collection("items");

    // Set up routes
    app.use("/api/items", itemsRouter); // This line ensures the /api/items route is active

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

startServer();

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});
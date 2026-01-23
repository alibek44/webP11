import express from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

//.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

//middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//mongodb
const client = new MongoClient(MONGO_URI);
let products;

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("shop");
    products = db.collection("products");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

startServer();



// GET /
app.get("/", (req, res) => {
  res.json({
    message: "Product API is running"
  });
});

// GET /api/products
app.get("/api/products", async (req, res) => {
  try {
    const { category, minPrice, sort, fields } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice) {
      filter.price = { $gte: Number(minPrice) };
    }

    let projection = {};
    if (fields) {
      fields.split(",").forEach((field) => {
        projection[field] = 1;
      });
    }

    let cursor = products.find(filter, { projection });

    if (sort === "price") {
      cursor = cursor.sort({ price: 1 });
    }

    const productList = await cursor.toArray();

    res.json({
      count: productList.length,
      products: productList
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await products.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProduct = {
      name,
      price,
      category,
      createdAt: new Date()
    };

    const result = await products.insertOne(newProduct);

    res.status(201).json({
      message: "Product created",
      product: {
        _id: result.insertedId,
        ...newProduct
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id 
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const updateData = req.body;

    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated",
      product: result.value
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id 
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const result = await products.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// 404 
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});
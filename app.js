import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// MongoDB Connection URI from .env file
const mongoURI = process.env.MONGO_URI; // Access the MONGO_URI from the .env file

// Connect to MongoDB Atlas
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define the Item model
const Item = mongoose.model('Item', new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
}));

// API Key middleware for protected routes
const apiKey = process.env.API_KEY;  // You can store the key in the .env file

// Middleware function to check for API key in the request headers
const checkApiKey = (req, res, next) => {
  const providedApiKey = req.headers['x-api-key'];  // Look for the key in the 'x-api-key' header
  if (!providedApiKey) {
    return res.status(401).json({ message: 'Unauthorized: API key missing' });
  }

  if (providedApiKey !== apiKey) {
    return res.status(403).json({ message: 'Forbidden: Invalid API key' });
  }

  next();  // If the API key is valid, proceed to the next middleware or route handler
};

// GET /api/items – Retrieve all items (No protection, open for everyone)
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/items/:id – Retrieve item by ID (No protection, open for everyone)
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/items – Create a new item (Protected)
app.post('/api/items', checkApiKey, async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    const newItem = new Item({ name, description, price });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/items/:id – Update an item (full update) (Protected)
app.put('/api/items/:id', checkApiKey, async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/items/:id – Update an item (partial update) (Protected)
app.patch('/api/items/:id', checkApiKey, async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/items/:id – Delete an item (Protected)
app.delete('/api/items/:id', checkApiKey, async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware (if needed)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
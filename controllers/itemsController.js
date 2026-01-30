// controllers/itemsController.js
import { ObjectId } from "mongodb";

// Get all items
export const getAllItems = (db) => async (req, res) => {
  try {
    const items = await db.collection("items").find().toArray();
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// Get item by ID
export const getItemById = (db) => async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const item = await db.collection("items").findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// Create a new item
export const createItem = (db) => async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newItem = {
    name,
    description,
    price,
  };

  try {
    const result = await db.collection("items").insertOne(newItem);
    res.status(201).json({
      message: "Item created",
      item: { _id: result.insertedId, ...newItem },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
};

// Update an item (full update)
export const updateItem = (db) => async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  const updatedItem = {
    name,
    description,
    price,
  };

  try {
    const result = await db.collection("items").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedItem },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({
      message: "Item updated",
      item: result.value,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Partial update an item
export const partialUpdateItem = (db) => async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const result = await db.collection("items").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedFields },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({
      message: "Item partially updated",
      item: result.value,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Delete an item
export const deleteItem = (db) => async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const result = await db.collection("items").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};
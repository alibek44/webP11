// controllers/itemsController.js

import { ObjectId } from "mongodb";

let itemsCollection;

export const initializeItems = (db) => {
  itemsCollection = db.collection("items");
};

// Get all items
export const getAllItems = async (req, res) => {
  try {
    const items = await itemsCollection.find().toArray();
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// Create a new item
export const createItem = async (req, res) => {
  const { name, description, price, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newItem = { name, description, price, category };

  try {
    const result = await itemsCollection.insertOne(newItem);
    res.status(201).json({ message: "Item created", itemId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
};

// Update an item (full update)
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  if (!name || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await itemsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, description, price, category } },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item updated", item: result.value });
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Partially update an item
export const partialUpdateItem = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const result = await itemsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item partially updated", item: result.value });
  } catch (error) {
    res.status(500).json({ error: "Failed to partially update item" });
  }
};

// Delete an item
export const deleteItem = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};
// routes/items.js

import express from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  partialUpdateItem,
  deleteItem
} from "../controllers/itemsController.js";

const router = express.Router();

// Define routes for items
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.put("/:id", updateItem);
router.patch("/:id", partialUpdateItem);
router.delete("/:id", deleteItem);

export default router;
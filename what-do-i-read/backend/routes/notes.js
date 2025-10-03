const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const { protect } = require("../middleware/authMiddleware");

// The name of your notes collection
const NOTES_COLLECTION = "bookNotes";

// GET /api/notes/book/:bookId - Get all notes for a specific book by authenticated user
router.get("/book/:bookId", protect, async (req, res) => {
  try {
    const db = getDB();
    const { bookId } = req.params;

    // FIX: Use NOTES_COLLECTION ('bookNotes') and filter by userId
    const notes = await db
      .collection(NOTES_COLLECTION)
      .find({ bookId: bookId, userId: req.user.id })
      .sort({ page: 1 })
      .toArray();
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes for book:", err);
    res.status(500).json({ message: "Error fetching notes for book." });
  }
});

// POST /api/notes - Create a new note
router.post("/", protect, async (req, res) => {
  try {
    const db = getDB();
    const { id, bookId, page, description } = req.body;

    if (!id || !bookId || page === undefined || !description) {
      return res
        .status(400)
        .json({
          message:
            "Missing required note fields (id, bookId, page, description).",
        });
    }

    const noteData = {
      id,
      bookId,
      userId: req.user.id, // Use ID from token
      page: Number(page),
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(NOTES_COLLECTION).insertOne(noteData);

    // Return the inserted object with MongoDB's _id included
    const newNote = { ...noteData, _id: result.insertedId };
    res.status(201).json(newNote);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ message: "Error creating note." });
  }
});

// PUT /api/notes/:id - Update an existing note by its custom ID
router.put("/:id", protect, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { page, description } = req.body;

    const result = await db.collection(NOTES_COLLECTION).updateOne(
      // FIX: Check ownership using userId and custom id
      { id: id, userId: req.user.id },
      { $set: { page: Number(page), description, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Note not found or you do not own it." });
    } // Fetch and return the complete updated note data.

    const updatedNote = await db
      .collection(NOTES_COLLECTION)
      .findOne({ id: id });

    if (!updatedNote) {
      return res
        .status(500)
        .json({ message: "Note updated but failed to retrieve." });
    }
    res.json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ message: "Error updating note." });
  }
});

// DELETE /api/notes/:id - Delete a note by its custom ID
router.delete("/:id", protect, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // FIX: Check ownership using userId and custom id
    const result = await db
      .collection(NOTES_COLLECTION)
      .deleteOne({ id: id, userId: req.user.id });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Note not found or you do not own it." });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Error deleting note." });
  }
});

module.exports = router;

const express = require('express');
const { getDB } = require('../db'); // Correctly imports getDB

const router = express.Router();

router.get('/by-genres', async (req, res) => {
  try {
    const db = getDB();
    const genreIds = req.query.ids ? req.query.ids.split(',') : [];
    console.log("4. Backend Received Genre IDs:", genreIds); 

    if (genreIds.length === 0) {
      return res.json([]);
    }

    // Use the $in operator to find all books where genreId is in the provided array
    const books = await db.collection('books').find({ genreId: { $in: genreIds } }).toArray();
    console.log("5. Database Found Books:", books); // <-- ADD THIS LOG

    res.json(books);
  } catch (err) {
    console.error("Failed to fetch books by genres:", err);
    res.status(500).json({ message: "Error fetching books by genres." });
  }
});

// GET /api/books/featured
router.get('/featured', async (req, res) => {
  try {
    const db = getDB();
    const featuredBooks = await db.collection('books').aggregate([
      { $sample: { size: 10 } }
    ]).toArray();
    res.json(featuredBooks);
  } catch (err) {
    console.error("Failed to fetch featured books:", err);
    res.status(500).json({ message: "Error fetching featured books." });
  }
});

// GET /api/books/search
router.get('/search', async (req, res) => {
  try {
    const db = getDB();
    const query = req.query.q || '';
    const searchResults = await db.collection('books').find({
      title: { $regex: query, $options: 'i' }
    }).toArray();
    res.json(searchResults);
  } catch (err) {
    console.error("Failed to search books:", err);
    res.status(500).json({ message: "Error searching for books." });
  }
});

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const books = await db.collection('books').find().toArray();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books." });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const bookId = req.params.id;
    const book = await db.collection('books').findOne({ id: bookId });
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch book." });
  }
});

module.exports = router;
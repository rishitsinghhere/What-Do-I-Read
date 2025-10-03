const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// ROUTE 1 & 2: These are correct and do not need changes.
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const genresWithData = await db.collection('genres').aggregate([
            { $lookup: { from: 'books', localField: 'id', foreignField: 'genreId', as: 'books' } },
            { $addFields: { bookCount: { $size: '$books' }, sampleCover: { $first: '$books.cover' } } },
            { $project: { books: 0 } }
        ]).toArray();
        res.json(genresWithData);
    } catch (err) {
        res.status(500).json({ message: "Error fetching genres." });
    }
});

router.get('/with-book-previews', async (req, res) => {
  try {
    const db = getDB();
    const genresWithPreviews = await db.collection('genres').aggregate([
      {
        $lookup: {
          from: 'books',
          localField: 'id',
          foreignField: 'genreId',
          as: 'books'
        }
      },
      {
        $addFields: {
          // --- THESE ARE THE ADDED FIELDS ---
          bookCount: { $size: '$books' },
          sampleCover: { $first: '$books.cover' },
          // This field for the book previews remains the same
          bookPreviews: { $slice: ['$books', 5] }
        }
      },
      {
        $project: {
          books: 0 // Remove the full books array for performance
        }
      }
    ]).toArray();
    res.json(genresWithPreviews);
  } catch (err) {
    console.error("Failed to fetch genres with book previews:", err);
    res.status(500).json({ message: "Error fetching data." });
  }
});

// ROUTE 3: GET /api/genres/:id (FINAL, ROBUST AGGREGATION LOGIC)
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        const genre = await db.collection('genres').findOne({ id: id });
        if (!genre) {
            return res.status(404).json({ message: "Genre not found" });
        }

        const booksInGenre = await db.collection('books').find({ genreId: id }).toArray();
        
        // 1. Separate standalone books
        const standaloneBooks = booksInGenre.filter(book => !book.seriesName);
        
        // 2. Group series books together
        const seriesBooksData = {};
        booksInGenre.forEach(book => {
            if (book.seriesName) {
                if (!seriesBooksData[book.seriesName]) {
                    seriesBooksData[book.seriesName] = [];
                }
                seriesBooksData[book.seriesName].push(book);
            }
        });

        const seriesIds = Object.keys(seriesBooksData);

        // If there are no series books, return early
        if (seriesIds.length === 0) {
            return res.json({ genreName: genre.name, standaloneBooks, seriesBooks: {} });
        }
        
        // 3. Fetch the official names for all found series in one query
        const seriesDetails = await db.collection('series').find({ id: { $in: seriesIds } }).toArray();
        
        // 4. Create a quick lookup map for the series names
        const seriesNameMap = seriesDetails.reduce((map, series) => {
            map[series.id] = series.name;
            return map;
        }, {});

        // 5. Build the final object for the frontend
        const seriesBooks = {};
        for (const seriesId of seriesIds) {
            if (seriesBooksData[seriesId]) {
                seriesBooks[seriesId] = {
                    name: seriesNameMap[seriesId] || "Unknown Series", // This is where the name is set
                    books: seriesBooksData[seriesId].sort((a, b) => a.seriesOrder - b.seriesOrder)
                };
            }
        }

        res.json({
            genreName: genre.name,
            standaloneBooks,
            seriesBooks
        });
    } catch (err) {
        console.error("Failed to fetch genre page data:", err);
        res.status(500).json({ message: 'Error fetching genre page data.' });
    }
});

module.exports = router;
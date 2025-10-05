const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const { connectDB } = require('./db');
const bookRoutes = require('./routes/books');
const genreRoutes = require('./routes/genres');
const noteRoutes = require('./routes/notes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(` Server is running and connected to DB on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
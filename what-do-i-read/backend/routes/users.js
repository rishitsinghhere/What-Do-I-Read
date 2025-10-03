const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const { protect } = require("../middleware/authMiddleware");

// GET /api/users/me - Get current user's data
router.get("/me", protect, (req, res) => {
  // The `protect` middleware already fetched the user and attached it to `req.user`
  // req.user is already cleaned (no password, no _id, has custom id)
  res.json(req.user);
});

// PUT /api/users/me - Update current user's profile
router.put("/me", protect, async (req, res) => {
  try {
    const db = getDB();
    const updateFields = {}; // Build update object based on what is provided in the request body
    if (req.body.username !== undefined) {
      updateFields.username = req.body.username;
    } // If no fields were provided, just return the current user's data

    if (Object.keys(updateFields).length === 0) {
      const userToReturn = { ...req.user };
      delete userToReturn._id;
      return res.status(200).json(userToReturn);
    }

    // --- FIX: Use updateOne then findOne to ensure the correct return status and document ---

    // 1. Attempt the update using updateOne
    const updateResult = await db
      .collection("users")
      .updateOne({ id: req.user.id }, { $set: updateFields });

    // Check if the user ID was matched for the update
    if (updateResult.matchedCount === 0) {
      // If the ID in the token doesn't match a user, this is a 404.
      console.error("User ID from token not found in database for update.");
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Retrieve the updated document (excluding the password)
    const finalUser = await db
      .collection("users")
      .findOne({ id: req.user.id }, { projection: { password: 0 } });

    // If for some reason findOne fails after updateOne succeeded, it's a server error.
    if (!finalUser) {
      console.error("Failed to retrieve user after successful update.");
      return res
        .status(500)
        .json({ message: "Failed to sync user data after update." });
    } // Clone and clean the object before sending

    const userToReturn = { ...finalUser };
    delete userToReturn._id; // Remove the MongoDB _id

    res.status(200).json(userToReturn); // Send the updated user object as JSON
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile." });
  }
});

// POST /api/users/me/saved-books - Add a book to saved list
router.post("/me/saved-books", protect, async (req, res) => {
  try {
    const db = getDB();
    const { bookId } = req.body; // Expecting { bookId: '...' } // 1. Update the database

    await db.collection("users").updateOne(
      { id: req.user.id },
      { $addToSet: { savedBooks: bookId } } // $addToSet prevents duplicates
    ); // 2. Fetch the updated user (without password)

    const updatedUser = await db
      .collection("users")
      .findOne({ id: req.user.id }, { projection: { password: 0 } }); // 3. Clone and clean the object (as done for login/register)

    const userToReturn = { ...updatedUser };
    delete userToReturn._id;

    res.status(200).json(userToReturn); // Return the full updated user object
  } catch (err) {
    console.error("Error saving book:", err);
    res.status(500).json({ message: "Error saving book." });
  }
});

// DELETE /api/users/me/saved-books/:bookId - Remove a book from saved list
router.delete("/me/saved-books/:bookId", protect, async (req, res) => {
  try {
    const db = getDB();
    const { bookId } = req.params; // 1. Update the database

    await db
      .collection("users")
      .updateOne({ id: req.user.id }, { $pull: { savedBooks: bookId } }); // 2. Fetch the updated user (without password)

    const updatedUser = await db
      .collection("users")
      .findOne({ id: req.user.id }, { projection: { password: 0 } }); // 3. Clone and clean the object

    const userToReturn = { ...updatedUser };
    delete userToReturn._id;

    res.status(200).json(userToReturn);
  } catch (err) {
    console.error("Error removing book:", err);
    res.status(500).json({ message: "Error removing book." });
  }
});

// PUT /api/users/me/playlists - Update all user playlists
router.put("/me/playlists", protect, async (req, res) => {
  try {
    const db = getDB();
    const { playlists } = req.body; // Overwrites the entire playlists array for the user
    const updateResult = await db
      .collection("users")
      .updateOne({ id: req.user.id }, { $set: { playlists: playlists } });

    // Since the API call in LibraryContext manually updates state,
    // we only need to confirm success.
    if (updateResult.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found for playlist update." });
    }

    res.status(200).json({ message: "Playlists updated successfully" });
  } catch (err) {
    console.error("Error updating playlists:", err);
    res.status(500).json({ message: "Error updating playlists." });
  }
});

module.exports = router;

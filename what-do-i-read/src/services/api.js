// The base URL of your backend server
const BASE_URL = "http://localhost:5001/api";

/**
 * A helper function to handle authenticated API requests.
 * It automatically adds the Authorization header with the JWT.
 * @param {string} url - The URL to fetch.
 * @param {object} options - The options for the fetch call.
 * @returns {Promise<any>} A promise that resolves to the JSON response.
 */
const fetchWithToken = async (url, options = {}) => {
  const { token, ...otherOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    ...otherOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...otherOptions, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }

  // Handle responses that might not have a JSON body (e.g., a DELETE request)
   const contentType = response.headers.get("content-type");
   if (contentType && contentType.indexOf("application/json") !== -1) {
     return response.json();
   }
   return; 
};

//================================================
// AUTH FUNCTIONS
//================================================

/**
 * Registers a new user.
 */
export const register = async (username, email, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    // Attempt to parse the JSON error body first
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // If JSON parsing fails (e.g., 500 with no body), throw a generic error
      throw new Error(
        response.statusText ||
          "Registration failed with an unknown server error."
      );
    } // Throw the server's specific message if available
    throw new Error(errorData.message || "Registration failed");
  } // Now that we know the response is OK, we can safely parse and return the data.

  const data = await response.json();
  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(
        response.statusText || "Login failed with an unknown server error."
      );
    }
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();
  return data;
};

//================================================
// PUBLIC DATA FUNCTIONS (Books & Genres)
//================================================

/**
 * Fetches all books from the API.
 */
export const getAllBooks = async () => {
  const response = await fetch(`${BASE_URL}/books`);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

/**
 * Fetches a single book by its custom ID.
 */
export const getBookById = async (id) => {
  const response = await fetch(`${BASE_URL}/books/${id}`);
  if (!response.ok) throw new Error("Book not found");
  return await response.json();
};

/**
 * Fetches all genres, enriched with book count and a sample cover.
 */
export const getAllGenres = async () => {
  const response = await fetch(`${BASE_URL}/genres`);
  if (!response.ok) throw new Error("Failed to fetch genres");
  return await response.json();
};

// --- THIS IS THE MISSING FUNCTION ---
/**
 * Fetches all genres, each with a preview of up to 5 books.
 */
export const getGenresWithBookPreviews = async () => {
  const response = await fetch(`${BASE_URL}/genres/with-book-previews`);
  if (!response.ok) {
    throw new Error("Failed to fetch genre previews");
  }
  return await response.json();
};

//================================================
// USER-SPECIFIC FUNCTIONS (Notes, Library, etc.)
//================================================

/**
 * Gets the full, up-to-date data for the logged-in user.
 */
export const getFreshUserData = async (token) => {
  return fetchWithToken(`${BASE_URL}/users/me`, { token }); // Note: Assumes a `/users/me` route
};

/**
 * Adds a book to the user's saved list.
 */
export const addSavedBook = async (bookId, token) => {
  return fetchWithToken(`${BASE_URL}/users/me/saved-books`, {
    method: "POST", // CRITICAL FIX: Send the ID inside an object named 'bookId'
    body: JSON.stringify({ bookId }),
    token,
  });
};

/**
 * Removes a book from the user's saved list.
 */
export const removeSavedBook = async (bookId, token) => {
  return fetchWithToken(`${BASE_URL}/users/me/saved-books/${bookId}`, {
    method: "DELETE",
    token,
  });
};

/**
 * Creates a new note.
 */
export const createNote = async (noteData, token) => {
  return fetchWithToken(`${BASE_URL}/notes`, {
    method: "POST",
    body: JSON.stringify(noteData),
    token,
  });
};

/**
 * Updates an existing note by its ID.
 */
export const updateNote = async (noteId, noteUpdateData, token) => {
  return fetchWithToken(`${BASE_URL}/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(noteUpdateData),
    token,
  });
};

/**
 * Gets all notes for a specific book.
 */
export const getNotesForBook = async (bookId, token) => {
  return fetchWithToken(`${BASE_URL}/notes/book/${bookId}`, { token });
};

/**
 * Deletes a note by its ID.
 */
export const deleteNote = async (noteId, token) => {
  return fetchWithToken(`${BASE_URL}/notes/${noteId}`, {
    method: "DELETE",
    token,
  });
};

/**
 * Replaces the user's entire list of playlists.
 */
export const updateUserPlaylists = async (playlists, token) => {
  return fetchWithToken(`${BASE_URL}/users/me/playlists`, {
    method: "PUT",
    body: JSON.stringify({ playlists }),
    token,
  });
};
/**
 * Fetches the structured data for the books page of a specific genre.
 * @param {string} genreId The ID of the genre.
 * @returns {Promise<Object|null>} A promise that resolves to the page data.
 */
export const getGenrePageData = async (genreId) => {
  try {
    // This new endpoint does all the heavy lifting on the server
    const response = await fetch(`${BASE_URL}/genres/${genreId}`);
    if (!response.ok) {
      throw new Error("Data for this genre not found");
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch page data for genre ${genreId}:`, error);
    return null;
  }
};

export const getFeaturedBooks = async () => {
  const response = await fetch(`${BASE_URL}/books/featured`);
  if (!response.ok) {
    throw new Error("Failed to fetch featured books");
  }
  return await response.json();
};

/**
 * Searches for books by title.
 * @param {string} query The search term.
 * @returns {Promise<Array>} A promise that resolves to an array of book objects.
 */
export const searchBooks = async (query) => {
  // Pass the search term as a URL query parameter
  const response = await fetch(
    `${BASE_URL}/books/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error("Failed to search books");
  }
  return await response.json();
};

/**
 * Fetches books that match a given list of genre IDs.
 * @param {string[]} genreIds - An array of genre ID strings.
 * @returns {Promise<Array>} A promise that resolves to an array of book objects.
 */
export const getBooksByGenres = async (genreIds) => {
  console.log("2. API Function Called with:", genreIds);
  if (genreIds.length === 0) return [];
  // Join the array into a comma-separated string for the URL query
  const idsQuery = genreIds.join(",");
  console.log(
    "3. Fetching URL:",
    `${BASE_URL}/books/by-genres?ids=${idsQuery}`
  );
  const response = await fetch(`${BASE_URL}/books/by-genres?ids=${idsQuery}`);
  if (!response.ok) {
    throw new Error("Failed to fetch books by genres");
  }
  return await response.json();
};

export const getMe = async (token) => {
  return fetchWithToken(`${BASE_URL}/users/me`, { token });
};

/**
 * Updates the user's profile.
 * @param {object} profileData - An object with the fields to update (e.g., { username: 'newname' }).
 * @param {string} token - The user's auth token.
 */
export const updateUserProfile = async (profileData, token) => {
  return fetchWithToken(`${BASE_URL}/users/me`, {
    method: "PUT",
    body: JSON.stringify(profileData),
    token,
  });
};

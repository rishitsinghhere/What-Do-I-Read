import * as Realm from "realm-web";

// Add this line
const { BSON } = Realm;

const app = new Realm.App({ id: "what-do-i-read-uxbmken" });

export function getBooksCollection() {
    const mongo = app.currentUser.mongoClient("mongodb-atlas");
    return mongo.db("What-Do-I-Read").collection("books");
}

export function getUsersCollection() {
    const mongo = app.currentUser.mongoClient("mongodb-atlas");
    return mongo.db("What-Do-I-Read").collection("users");
}

export async function authenticateAnonymously() {
    if (!app.currentUser) {
        await app.logIn(Realm.Credentials.anonymous());
    }
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
        isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
        errors: {
            minLength: !minLength ? "Password must be at least 8 characters long" : null,
            hasUppercase: !hasUppercase ? "Password must contain at least one uppercase letter" : null,
            hasLowercase: !hasLowercase ? "Password must contain at least one lowercase letter" : null,
            hasNumber: !hasNumber ? "Password must contain at least one number" : null,
            hasSpecialChar: !hasSpecialChar ? "Password must contain at least one special character" : null
        }
    };
}

export function validateUsername(username) {
    const isValidLength = username.length <= 15 && username.length > 0;
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(username);
    
    return {
        isValid: isValidLength && isAlphanumeric,
        errors: {
            length: !isValidLength ? "Username must be 1-15 characters long" : null,
            format: !isAlphanumeric ? "Username can only contain letters and numbers" : null
        }
    };
}

export async function registerUser(username, email, password) {
    try {
        await authenticateAnonymously();
        
        if (!validateEmail(email)) {
            throw new Error("Please enter a valid email address");
        }
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            const errorMessages = Object.values(passwordValidation.errors).filter(Boolean);
            throw new Error(errorMessages.join(". "));
        }
        
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            const errorMessages = Object.values(usernameValidation.errors).filter(Boolean);
            throw new Error(errorMessages.join(". "));
        }
        
        const usersCollection = getUsersCollection();
        
        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
            throw new Error("User already exists with this email address");
        }
        
        const newUser = {
            name: username,
            email: email,
            password: password,
            savedBooks: [],
            playlists: [{
                id: "default",
                name: "Saved",
                bookIds: []
            }],
            createdAt: new Date()
        };
        
        const result = await usersCollection.insertOne(newUser);
        return { ...newUser, _id: result.insertedId };
    } catch (error) {
        throw error;
    }
}

export async function loginUser(email, password) {
    try {
        await authenticateAnonymously();
        
        if (!validateEmail(email)) {
            throw new Error("Please enter a valid email address");
        }
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error("Please enter a valid password");
        }
        
        const usersCollection = getUsersCollection();
        const user = await usersCollection.findOne({ email: email, password: password });
        
        if (!user) {
            throw new Error("Account does not exists.");
        }
        
        return user;
    } catch (error) {
        throw error;
    }
}

export async function updateUserProfile(userId, updates) {
    try {
        await authenticateAnonymously();
        
        if (updates.name !== undefined) {
            const usernameValidation = validateUsername(updates.name);
            if (!usernameValidation.isValid) {
                const errorMessages = Object.values(usernameValidation.errors).filter(Boolean);
                throw new Error(errorMessages.join(". "));
            }
        }
        
        const usersCollection = getUsersCollection();
        const result = await usersCollection.updateOne(
            { _id: userId },
            { $set: updates }
        );
        
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateUserPlaylists(userId, playlists) {
    try {
        await authenticateAnonymously();
        const usersCollection = getUsersCollection();
        const result = await usersCollection.updateOne(
            { _id: userId },
            { $set: { playlists: playlists } }
        );
        return result;
    } catch (error) {
        console.error("Error updating playlists:", error);
        throw error;
    }
}

export async function updateUserSavedBooks(userId, book) {
  try {
    await authenticateAnonymously();
    const usersCollection = getUsersCollection();

    // Ensure _id is treated as ObjectId
    const objectId = typeof userId === "string" ? new BSON.ObjectId(userId) : userId;

    // Try to update progress if the book already exists
    const result = await usersCollection.updateOne(
      { _id: objectId, "savedBooks.bookId": book.bookId },
      { $set: { "savedBooks.$.progress": book.progress } }
    );

    // If the book wasn't in savedBooks, push it
    if (result.matchedCount === 0) {
      await usersCollection.updateOne(
        { _id: objectId },
        { $push: { savedBooks: book } }
      );
    }

    return result;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
}

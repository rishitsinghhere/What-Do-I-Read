import * as Realm from "realm-web";

const app = new Realm.App({ id: "what-do-i-read-uxbmken" });

export async function getAnonymousUser() {
  if (!app.currentUser || app.currentUser.isLoggedIn === false) {
    return await app.logIn(Realm.Credentials.anonymous());
  }
  return app.currentUser;
}

export async function registerUser(name, email, password) {
  await app.emailPasswordAuth.registerUser(email, password);
  const user = await app.logIn(Realm.Credentials.emailPassword(email, password));

  const mongo = user.mongoClient("mongodb-atlas");
  const usersCollection = mongo.db("What-Do-I-Read").collection("users");

  await usersCollection.insertOne({
    name,
    email,
    createdAt: new Date(),
    readingList: [],
    favorites: [],
  });

  return user;
}

export async function loginUser(email, password) {
  const user = await app.logIn(Realm.Credentials.emailPassword(email, password));
  return user;
}

export async function saveBookForUser(bookId) {
  const user = app.currentUser;
  if (!user || user.isLoggedIn === false || user.providerType === "anon-user") {
    throw new Error("Please log in to save books to your library.");
  }

  const mongo = user.mongoClient("mongodb-atlas");
  const usersCollection = mongo.db("What-Do-I-Read").collection("users");

  await usersCollection.updateOne(
    { _id: user.id },
    { $addToSet: { favorites: bookId } }
  );
}
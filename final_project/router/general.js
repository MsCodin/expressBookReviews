const express = require("express");
const axios = require("axios"); // Import axios for async requests
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    let userswithsamename = users.filter((user) => {
      return user.username === username;
    });

    if (userswithsamename.length === 0) {
      users.push({ username: username, password: password });
      return res.status(200).json({
        message: "Customer successfully registered. Now you can login",
      });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({
    message: "Unable to register user. Username and password are required.",
  });
});

public_users.get("/", async function (req, res) {
  try {
    // Alternatively, you can wrap the local books object in a Promise or fetch via Axios if running a server
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });

    const allBooks = await getBooks;
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching book list", error: error.message });
  }
});

public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const getBookByIsbn = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    });

    const bookDetails = await getBookByIsbn;
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author.toLowerCase();

  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      let filtered_books = [];
      let keys = Object.keys(books);

      keys.forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author) {
          filtered_books.push(books[isbn]);
        }
      });

      if (filtered_books.length > 0) {
        resolve(filtered_books);
      } else {
        reject(new Error("Books by this author not found"));
      }
    });

    const filtered_books = await getBooksByAuthor;
    return res.status(200).json(filtered_books);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title.toLowerCase();

  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      let filtered_books = [];
      let keys = Object.keys(books);

      keys.forEach((isbn) => {
        if (books[isbn].title.toLowerCase() === title) {
          filtered_books.push(books[isbn]);
        }
      });

      if (filtered_books.length > 0) {
        resolve(filtered_books);
      } else {
        reject(new Error("Book with this title not found"));
      }
    });

    const filtered_books = await getBooksByTitle;
    return res.status(200).json(filtered_books);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;

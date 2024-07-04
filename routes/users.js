const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { generateSalt, hashPassword, comparePassword } = require('../crypto');
const verifyToken = require("../auth");
const cookieParser = require('cookie-parser');

const router = express.Router();

router.use(cookieParser());
// Function to get the list of users from users.json
const getUsers = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../data/users.json"));
        return JSON.parse(data);
    } catch (error) {
        console.log("Error while reading users.json:", error);
        return [];
    }
};

// Function to save new users to users.json
const saveUsers = (users) => {
    try {
        const data = JSON.stringify(users, null, 2);
        fs.writeFileSync(path.join(__dirname, '../data/users.json'), data, 'utf8');
    } catch (error) {
        console.error('Error saving users:', error.message);
        throw error;
    }
};

const isAdmin = (req, res, next) => {
    if (req.cookies.token && req.cookies.token === 'mySuperSecretKey') {
        console.log(token);
        next();
    } else {
        res.status(403).send("Access Denied!!!");
    }
};

// View the users
router.get("/", isAdmin, (req, res) => {
    let users = getUsers();
    res.render("users.ejs", { data: users });
});

// Add new user
router.get("/new", (req, res) => {
    res.render("new.ejs");
});
router.post("/new", async (req, res) => {
    let { username, email, password } = req.body;
    let users = getUsers();
    let id = uuidv4();
    let salt = generateSalt();
    let hashedPassword = hashPassword(password, salt);
    users.push({ id, username, email, password: hashedPassword, salt });
    saveUsers(users);
    res.redirect("/");
});

// Edit route
router.get("/:id/edit", verifyToken, (req, res) => {
    let { id } = req.params;
    let users = getUsers();
    let user = users.find(u => u.id === id);
    if (!user) {
        res.status(404).send("User not found");
        return;
    }
    if (req.cookies.token !== user.token) {
        res.status(403).send("Access Denied");
        return;
    }
    res.render("edit.ejs", { user, token: req.cookies.token });
});
router.patch("/:id", verifyToken, async (req, res) => {
    let { id } = req.params;
    let { username, password } = req.body;
    let users = getUsers();
    let user = users.find(u => u.id === id);
    if (comparePassword(password, user.salt, user.password)) {
        user.username = username;
        saveUsers(users);
        res.redirect("/login?message=Username updated. Please login again.");
    } else {
        res.send("WRONG Password!");
    }
});

// Delete Route
router.get("/:id/delete", verifyToken, (req, res) => {
    let { id } = req.params;
    let users = getUsers();
    let user = users.find(u => u.id === id);
    res.render("delete.ejs", { user });
});
router.delete("/:id", verifyToken, async (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let users = getUsers();
    let user = users.find(u => u.id === id);
    if (comparePassword(password, user.salt, user.password)) {
        users = users.filter(u => u.id !== id);
        saveUsers(users);
        res.redirect("/user");
    } else {
        res.send("WRONG Password!");
    }
});

module.exports = router;
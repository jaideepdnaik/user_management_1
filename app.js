const express = require("express");
const fs = require("fs");
const methodOverride = require('method-override');
const path = require("path");
const crypto = require("crypto");
const { comparePassword } = require('./crypto');
const app = express();

const DATA_FILE = path.join(__dirname, "./data/users.json");

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const users = require("./routes/users");
app.use("/user", users);

app.get("/", (req, res) => {
    let users = JSON.parse(fs.readFileSync(DATA_FILE));
    res.render("home.ejs", { count: users.length });
});

// Render login page
app.get('/login', (req, res) => {
    res.render("login.ejs");
});

// Handle login form submission
app.post("/doLogin", async (req, res) => {
    let { username, password } = req.body;
    let users = readData();
    let user = users.find(u => u.username === username);
    if (user && comparePassword(password, user.salt, user.password)) {
        const token = generateToken();
        user.token = token;
        writeData(users);
        res.json({ token, user });
    } else {
        res.status(401).json({ message : "Login Failed" });
    }
});

app.get("/loginSuccess", (req, res) => {
    const userParam = req.query.user;
    let user;
    if (userParam) {
        try {
            user = JSON.parse(userParam);
        } catch(error) {
            res.status(400).json({ message: "Invalid user data" });
        }
    } else {
        res.status(400).json({ message: "No user data" });
    }
    res.render("loginSuccess.ejs", { user });
});

// Logout route
app.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect("/login");
});

app.listen(8080, () => {
    console.log("Server is running on port http://localhost:8080");
});

// Read data from JSON file
function readData() {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

// Write data to JSON file
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate a random token
function generateToken() {
    return crypto.randomBytes(48).toString('hex');
}
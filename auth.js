const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "./data/users.json");

function readData() {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log(token);
    if (!token) {
        res.status(401).send("Unauthorized");
        return;
    }
    let users = readData();
    let user = users.find(u => u.token === token);
    if (!user) {
        res.status(401).send("Unauthorized");
        return;
    }
    if (req.params.id !== user.id) {
        res.status(403).send("Access Denied");
        return;
    }
    next();
};

module.exports = verifyToken;
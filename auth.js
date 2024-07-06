const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "./data/users.json");

function readData() {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] || req.query.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const users = readData();
    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(401).json({ message: 'Access denied' });
    }

    req.user = user;
    next();
};

module.exports = verifyToken;
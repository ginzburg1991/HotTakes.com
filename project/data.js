const mysql = require(`mysql-await`);
const bcrypt = require('bcrypt');
var connPool = mysql.createPool({
    connectionLimit: 5,
    host: "127.0.0.1",
    user: "C4131F23U74",
    database: "C4131F23U74",
    password: "5526",
});



async function getAllTakes() {
    const query = `
        SELECT post.*, user.username 
        FROM post 
        JOIN user ON post.userId = user.id 
        ORDER BY post.date DESC`;
    return await connPool.awaitQuery(query);
}

async function getPopularTakes(page, limit) {
    const offset = (page - 1) * limit;
    const query = `
        SELECT post.*, user.username 
        FROM post 
        JOIN user ON post.userId = user.id 
        ORDER BY post.likes DESC 
        LIMIT ? OFFSET ?`;
    return await connPool.awaitQuery(query, [limit, offset]);
}

async function getRecentTakes(page, limit) {
    const offset = (page - 1) * limit;
    const query = `
        SELECT post.*, user.username 
        FROM post 
        JOIN user ON post.userId = user.id 
        ORDER BY post.date DESC 
        LIMIT ? OFFSET ?`;
    return await connPool.awaitQuery(query, [limit, offset]);
}


async function getTakes(sortBy, page = 1, limit = 3) {
    switch (sortBy) {
        case 'all':
            return getAllTakes();
        case 'popular':
            return getPopularTakes(page, limit);
        default:
            return getRecentTakes(page, limit);
    }
}




async function addTake(takeContent, userId) {
    const query = "INSERT INTO post (date, take, likes, userId) VALUES (CURRENT_TIMESTAMP, ?, 0, ?)";
    return await connPool.awaitQuery(query, [takeContent, userId]);
}
async function likeTake(id) {
    const updateQuery = "UPDATE post SET likes = likes + 1 WHERE id = ?";
    await connPool.awaitQuery(updateQuery, [id]);

    const selectQuery = "SELECT likes FROM post WHERE id = ?";
    const result = await connPool.awaitQuery(selectQuery, [id]);
    return result[0].likes;
}
async function editTake(id, take, userId) {
    const updateQuery = "UPDATE post SET take = ? WHERE id = ? AND userId = ?";
    const result = await connPool.awaitQuery(updateQuery, [take, id, userId]);
    return result.affectedRows > 0;
}

async function deleteTake(id, userId) {
    const query = "DELETE FROM post WHERE id = ? AND userId = ?";
    const result = await connPool.awaitQuery(query, [id, userId]);
    return result.affectedRows > 0;
}

async function countPosts() {
    const query = "SELECT COUNT(*) as total FROM post";
    const result = await connPool.awaitQuery(query);
    return result[0].total;
}


async function getUserByUsername(username) {
    const query = "SELECT * FROM user WHERE username = ?";
    const result = await connPool.awaitQuery(query, [username]);
    return result.length > 0 ? result[0] : null;
}

async function getUserFromDatabase(username) {
    const query = "SELECT * FROM user WHERE username = ?";
    const result = await connPool.awaitQuery(query, [username]);
    return result.length > 0 ? result[0] : null;
}


async function registerUser(username, password) {
    
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        throw new Error('Username already exists');
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hashed password for registration: ${hashedPassword}`);

   
    const query = "INSERT INTO user (username, password) VALUES (?, ?)";
    return await connPool.awaitQuery(query, [username, hashedPassword]);
}

async function getUserIdByUsername(username) {
    const query = "SELECT id FROM user WHERE username = ?";
    const result = await connPool.awaitQuery(query, [username]);
    return result.length > 0 ? result[0].id : null;
}

async function checkPostOwnership(postId, userId) {
    const query = "SELECT COUNT(*) as count FROM post WHERE id = ? AND userId = ?";
    const result = await connPool.awaitQuery(query, [postId, userId]);
    return result[0].count > 0;
}


module.exports = { getTakes, addTake, likeTake, editTake, deleteTake, countPosts, getUserByUsername, registerUser, getUserIdByUsername, checkPostOwnership, getUserFromDatabase };




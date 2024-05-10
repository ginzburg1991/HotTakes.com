const express = require('express');
const basicAuth = require('express-basic-auth');
const bcrypt = require('bcrypt');
const data = require('./data.js');
const app = express();


app.use(express.urlencoded({extended: true}));
app.use("/resources", express.static("resources"));
app.use(express.json());

const authMiddleware = basicAuth({
    authorizer: async (username, password, cb) => {
        const user = await data.getUserByUsername(username);
        if (!user) return cb(null, false);
        const authenticated = await bcrypt.compare(password, user.password);
        return cb(null, authenticated);
    },
    authorizeAsync: true,
    challenge: true
});

app.set("views",  `${__dirname}/templates`);
app.set("view engine", "pug");

app.get("/", (req, res) => {
    res.redirect("/home");
});
app.get("/home", async (req, res) => {
    const sortBy = req.query.sort || 'recent';
    const page = parseInt(req.query.page) || 1;
    const limit = 3; 

    try {
        let takes;
        let totalPosts = 0;
        if (sortBy === 'all') {
            takes = await data.getTakes('all');
            totalPosts = await data.countPosts(); 
        } else {
            takes = await data.getTakes(sortBy, page, limit);
            totalPosts = await data.countPosts(); 
        }

        const hasNextPage = page * limit < totalPosts;
        res.render("home", { takes, sortBy, currentPage: page, hasNextPage });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving takes");
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");  
});



app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    console.log(`Raw password received for registration: ${password}`); 

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hashed password: ${hashedPassword}`);

    try {
        await data.registerUser(username, hashedPassword);
        console.log(`User registered: ${username}`);
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error registering user.");
    }
});




app.post("/newTake", async (req, res) => {
    const { content, username } = req.body;
    try {
        const userId = await data.getUserIdByUsername(username);
        await data.addTake(content, userId);
        res.redirect("/home");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await data.getUserByUsername(username);
        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(`Password comparison result: ${passwordMatch}`);

        if (passwordMatch) {
            console.log(`Login successful: ${username}`);
            res.status(200).send('Login successful');
        } else {
            console.log(`Login failed: Incorrect password for username: ${username}`);
            res.status(401).send('Unauthorized');
        }
    } catch (error) {
        console.error(`Error during login: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});







app.put("/like/take/:id", async (req, res) => {
    const takeId = req.params.id;
    try {
        const newLikeCount = await data.likeTake(takeId);
        res.json({ newLikeCount: newLikeCount });
    } catch (error) {
        console.error("Error liking take:", error);
        res.status(500).send("Error liking take");
    }
});

app.put("/edit/take", async (req, res) => {
    const { id: takeId, take: newContent, username } = req.body;
    try {
        const userId = await data.getUserIdByUsername(username);
        const isOwner = await data.checkPostOwnership(takeId, userId);

        if (!isOwner) {
            res.status(403).send("Not authorized to edit this take");
            return;
        }

        const success = await data.editTake(takeId, newContent, userId);
        if (success) {
            res.send({ message: "Take successfully edited" });
        } else {
            res.status(404).send("Take not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


app.delete("/delete/take/:id", async (req, res) => {
    const takeId = req.params.id;
    const username = req.body.username; 

    try {
        const userId = await data.getUserIdByUsername(username);
        
        
        const isOwner = await data.checkPostOwnership(takeId, userId);

        if (isOwner) {
            const success = await data.deleteTake(takeId, userId);
            if (success) {
                res.status(200).send("Take deleted");
            } else {
                res.status(403).send("Not authorized to delete this take");
            }
        } else {
            
            res.status(403).send("Oops, that's not your take");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


app.use((req, res) => {
    res.status(404).render("404.pug");
});
const PORT = 4131;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

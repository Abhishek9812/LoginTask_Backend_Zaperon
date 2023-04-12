const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
const secretKey = 'alkjfaslk33456ajhflksjdht345f34sedqi12321w425ewrwuednbckcidfuewh'; // Replace with your secret key for JWT
const mongoURI = 'mongodb://localhost:27017/loginTaskZaperon'; // Replace with your MongoDB URI

// User model
const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    password: String
}));


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });

app.use(express.json());

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user in MongoDB
    const user = await User.findOne({ email, password });

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: '1h' });
    res.status(200).send({user, token });
});

// Protected route
// this route is protected by the authentication. I make this route for show you how to use middleware.
app.get('/protected', authenticateToken, (req, res) => {
    // Access protected route
    res.json({ message: 'This is a protected route', user: req.user });
});

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(403).json({ message: 'Authentication token not provided' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired authentication token' });
        }

        req.user = user;
        next();
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});

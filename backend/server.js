const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TodoModel = require('./models/todoList');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to your MongoDB database
mongoose.connect('mongodb://127.0.0.1/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Check for database connection errors
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

// Get saved tasks from the database
app.get('/getTodoList', (req, res) => {
    TodoModel.find({})
        .then((todoList) => res.json(todoList))
        .catch((err) => res.status(500).json({ error: err.message }));
});

// Add new task to the database
app.post('/addTodoList', (req, res) => {
    TodoModel.create({
        task: req.body.task,
        status: req.body.status,
        deadline: req.body.deadline,
    })
        .then((todo) => res.json(todo))
        .catch((err) => res.status(500).json({ error: err.message }));
});

// Update task fields (including deadline)
app.post('/updateTodoList/:id', (req, res) => {
    const id = req.params.id;
    const updateData = {
        task: req.body.task,
        status: req.body.status,
        deadline: req.body.deadline,
    };
    TodoModel.findByIdAndUpdate(id, updateData, { new: true })
        .then((todo) => res.json(todo))
        .catch((err) => res.status(500).json({ error: err.message }));
});

// Delete task from the database
app.delete('/deleteTodoList/:id', (req, res) => {
    const id = req.params.id;
    TodoModel.findByIdAndDelete(id)
        .then((todo) => res.json(todo))
        .catch((err) => res.status(500).json({ error: err.message }));
});

// Placeholder authMiddleware
const authMiddleware = (req, res, next) => {
    // Implement your authentication logic here
    // For now, just mock a user ID
    req.user = { id: 'mockUserId' }; // Replace with actual user ID
    next();
};

// Get task statistics (requires authentication)
app.get('/getTaskStats', authMiddleware, async (req, res) => {
    try {
        const completed = await TodoModel.countDocuments({ status: 'completed', userId: req.user.id });
        const pending = await TodoModel.countDocuments({ status: 'pending', userId: req.user.id });
        res.json({ completed, pending });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

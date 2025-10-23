const express = require('express');
const cors = require('cors');
const authrouter = require('./routes/auth');
const taskrouter = require('./routes/Tasks');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authrouter);
app.use('/tasks', taskrouter);

app.get('/', (req, res) => {
    res.send('Task Manager API is running...');
});

module.exports = app;
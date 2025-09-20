const express = require('express');//import express
const Taskapp = express();//create the app
const cors = require('cors');
Taskapp.use(express.json());//Understand JSON request data
Taskapp.use(cors());
const mongoose = require('mongoose');//import the cloud
require('dotenv').config();//use.env

const authrouter = require('./routes/auth');
Taskapp.use('/auth',authrouter);

const tasksrouter = require('./routes/Tasks');
Taskapp.use('/tasks',tasksrouter);
//connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error('❌ MongoDB connection error:', err));
//send the page route using get method
Taskapp.get('/', (req,res) => {
    res.send('Task Manager API is running...');
})
//listen to server 
const PORT = process.env.PORT;
Taskapp.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
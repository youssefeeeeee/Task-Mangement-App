const mongoose = require('mongoose');
const { schema } = require('./user');

const taskShema = new mongoose.Schema({
    title: {
        type:String,
        required:true,
    },
    description: String,
    status: {
        type: String,
        enum:['todo','in-progress','done'],
        default:'todo',
    },
    duedate: Date,
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    }
});

module.exports = mongoose.model('Task',taskShema);
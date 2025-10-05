const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');


const router = express.Router();
//creation d'une task
router.post('/',auth,async (req,res) => {
    try{
    const {title,description,status,duedate} = req.body;
    const task = new Task({
        title,
        description,
        status,
        duedate,
        userId:req.user.userId
    });
    await task.save();
    res.status(201).json(task);
    } catch(err) {
        console.log(err);
        res.status(500).json({message : "serveur error"});
    }
});
//affiche de tous les tasks

router.get('/',auth,async (req,res) => {
    try{
        const {status,search} = req.query;
        const query = {userId:req.user.userId};
        let tasks;
        if(status && status !== "all"){
            query.status = status;
        }
        if(search){
            query.title = {$regex: search, $options : 'i'};
        }
        tasks = await Task.find(query);
        res.json(tasks);
    }catch(err){
        res.status(500).json({message: "erreur de serveur"});
    }
});

//update une tache precise

router.put('/:id',auth, async (req,res) => {
    try{
        const task = await Task.findByIdAndUpdate({_id : req.params.id,userId:req.user.userId},req.body,{new:true});
        if(!task) return res.status(404).json({message: "Tache introuvable"});
        res.json(task);
    } catch(err){
        console.log(err);
        res.status(500).json({message: "erreur de serveur"});
    }
});

// suprrimer une tache

router.delete('/:id',auth, async (req,res) => {
    try{
        const task = await Task.findByIdAndDelete({_id : req.params.id,userId:req.user.userId});
        if(!task) return res.status(404).json({message: "Tache introuvable"});
        res.json({message: "tache supprimer avec succes"});
    } catch(err){
        res.status(500).json({message: "erreur de serveur"});
    }
});

module.exports = router;
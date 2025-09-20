const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const User = require('../models/user');
//creation d'un acc
router.post('/register',async (req,res) => {
    try{
        const { name, email, password } = req.body;
        //verifier si user existe deja 
        const userexist = await User.findOne({email});
        if(userexist) return res.status(400).json({message : "email already exist"});
        //sinon --> nv user donc hasher son mot de passe
        const passhash = await bcrypt.hash(password,10);
        //cree-le
        const Newuser = new User({name,email,password: passhash});
        await Newuser.save();
        res.status(201).json({message: "Utilisateur créé avec succès"});
    }catch(err)
    {
        res.status(500).json({message : "Erreur serveur"});
    }
});

//login

router.post('/login',async (req,res) => {
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({messgae : "email ou mot de pass incorrect"});
        const isvalid = await bcrypt.compare(password, user.password);
        if(!isvalid) return res.status(400).json({message : "mot de pass incorrect"});
        const token = JWT.sign({ userId: user._id }, process.env.JWT_KEY, { expiresIn: '1d' });
        res.json({token});
    } catch(err){
        console.error('Erreur dans /login :', err);
        res.status(500).json({message: "erreur serveur"});
    }
});

module.exports = router;
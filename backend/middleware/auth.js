const jwt = require('jsonwebtoken');
module.exports = (req,res,next) => {
    const authheader = req.headers['authorization'];
     // Le token est dans le format "Bearer tokenIci"
    const token = authheader && authheader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Accès refusé : token manquant' });
    try{
        const decode = jwt.verify(token,process.env.JWT_KEY);
        req.user = decode;
        next();
    } catch(err){
        res.status(403).json({message: "'Token invalide'"});
    }
};
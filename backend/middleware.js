const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./config");
const authMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(403).json({});
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoding = jwt.verify(token, JWT_SECRET);
        if (decoding.userId){
            req.userId = decoding.userId;
            next();
        }
        else{
            return res.status(403).json({});
        }
    }
    catch(err){
        return res.status(403).json({});
    }
};

module.exports = {
    authMiddleware
};
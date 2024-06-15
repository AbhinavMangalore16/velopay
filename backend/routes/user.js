const express = require('express');
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config");
const { User, Account } = require('../db');
const { authMiddleware } = require('../middleware');

const validSignup = zod.object({
    username: zod.string().email(),
    password: zod.string().min(1, "Password is required"),
    firstName: zod.string().min(1, "First name is required"),
    lastName: zod.string().min(1, "Last name is required")
});

const validSignin = zod.object({
    username: zod.string().email(),
    password: zod.string().min(1, "Password is required")
});

const updateUser = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.post("/signup", async (req, res) => {
    const body = req.body;
    const result = validSignup.safeParse(body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid input!",
            errors: result.error.errors
        });
    }

    const existingUser = await User.findOne({
        username: body.username
    });

    if (existingUser) {
        return res.status(409).json({
            message: "Username has already been taken!"
        });
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const newUser = await User.create({ ...body, password: hashedPassword });
    const id = newUser._id;
    await Account.create({
        userId,
        balance: 1 + Math.random()*10000
    })
    const jwttoken = jwt.sign({
        userId: newUser._id
    }, JWT_SECRET);

    res.json({
        message: "User created successfully!",
        token: jwttoken
    });
});

router.post("/signin", async (req, res) => {
    const body = req.body;
    const result = validSignin.safeParse(body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid input!",
            errors: result.error.errors
        });
    }

    const user = await User.findOne({
        username: body.username
    });

    if (!user) {
        return res.status(401).json({
            message: "Incorrect username or password!"
        });
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Incorrect username or password!"
        });
    }

    const jwttoken = jwt.sign({
        userId: user._id
    }, JWT_SECRET);

    res.json({
        message: "You have successfully signed in!",
        token: jwttoken
    });
});

router.put("/", authMiddleware, async(req, res, next)=>{
    const body = req.body;
    const result = updateUser.safeParse(body);
    if (!result.success){
        res.status(411).json({
            message: "Invalid inputs!"
        })
    }
    const user = await User.updateOne({_id: req.userId}, req.body);
    res.json({
        message: "User details updated successfully!"
    })
})

router.get('/filter', async(req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [{
            firstName:{
                "$regex": filter
            },
            lastName:{
                "$regex": filter
            }
        }]
    })
    res.json({
        user: users.map(user=>({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;
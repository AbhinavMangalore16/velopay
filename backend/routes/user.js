const express = require('express');
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config");
const { User } = require('../db');

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

module.exports = router;
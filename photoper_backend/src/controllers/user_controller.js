import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

const jwt_secret_key = process.env.JWT_SECRET_KEY;

// ✅ Signup API
export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                data: {},
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { email: newUser.email, id: newUser._id },
            jwt_secret_key,
            { expiresIn: "7d" } // Token expires in 7 days
        );

        res.status(201).json({
            message: "User created successfully",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                token,
            },
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({
            message: "Something went wrong",
            data: {},
        });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                message: "User not found",
                data: {},
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials",
                data: {},
            });
        }

        const token = jwt.sign(
            { email: existingUser.email, id: existingUser._id },
            jwt_secret_key,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            data: {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                token,
            },
        });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({
            message: "Something went wrong",
            data: {},
        });
    }
};

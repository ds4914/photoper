import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const auth = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized User: No token provided" });
        }

        token = token.split(" ")[1]; // Remove "Bearer"
        const user = jwt.verify(token, SECRET_KEY);
        req.userId = user.id; // Set user ID in request
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized User: Invalid token" });
    }
};

export default auth;

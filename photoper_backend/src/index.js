import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routes/user_routes.js"; 
import eventRouter from "./routes/event_routes.js"; 
import imageRouter from "./routes/image_routes.js"; 

const app = express();
app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/events", eventRouter);
app.use("/images", imageRouter);

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://dineshsuthar4914:zcbEWgCTFsrQEDJm@cluster0.6tm8q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("MongoDB connected successfully!");
        // Start server after MongoDB connection
        app.listen(PORT, "0.0.0.0", () => {
            console.log("Server started on port " + PORT);
        });
    })  
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

app.get("/", (req, res) => {
    res.send("Photograph admin panel");
});

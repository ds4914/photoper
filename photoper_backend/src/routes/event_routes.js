import express from "express";
import auth from "../middlewares/auth.js";
import { upload, processImage, processVideo } from "../middlewares/upload.js";
import { createEvent, getAllEvents, getEventById, deleteEvent } from "../controllers/event_controller.js";

const router = express.Router();

router.get("/getEventById/:eventId", auth, getEventById);

router.post(
    "/create",
    auth,
    upload.fields([{ name: "images", maxCount: 2000 }, { name: "videos", maxCount: 2000 }]),
    processImage,
    processVideo,
    createEvent
);

router.get("/getAllEvents", auth, getAllEvents);

router.delete("/delete/:eventId", auth, deleteEvent);

export default router;

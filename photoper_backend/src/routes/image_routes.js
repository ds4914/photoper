import express from "express";
import auth from "../middlewares/auth.js";
import { getEventImages, uploadImageNames, getSelectedImages } from "../controllers/image_controller.js";

const router = express.Router();

///user side
router.post("/getEventImages", auth, getEventImages);

///user side
router.post("/uploadImageName", auth, uploadImageNames);

///photographer side
router.post("/getSelectedImages", auth, getSelectedImages);

export default router;

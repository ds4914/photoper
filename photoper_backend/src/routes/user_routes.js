import express from "express";
import {signin,signup} from "../controllers/user_controller.js";

const userRouter = express.Router();

userRouter.post("/signin",signin);

userRouter.post("/register",signup);

export default userRouter;

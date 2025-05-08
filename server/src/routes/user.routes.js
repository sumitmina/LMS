import express from "express"
import { Router } from "express";
import { clearkWebhooks } from "../controllers/webHooks.controller.js";

const userRouter = Router();

userRouter.route("/clerk").post(express.json(),clearkWebhooks)

export default userRouter;
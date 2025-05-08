import { Router } from "express";
import { clearkWebhooks } from "../controllers/webHooks.controller.js";

const router = Router();

router.route("/clerk").post(express.json(),clearkWebhooks)

export default router;
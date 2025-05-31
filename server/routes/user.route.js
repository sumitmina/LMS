import { Router } from "express";
import { getUserData, userEnrolledCourses, purchaseCourse } from "../controllers/user.controller.js";

const router = Router()

router.route("/data").get(getUserData)
router.route("/enrolled-courses").get(userEnrolledCourses)
router.route("/purchase").post(purchaseCourse)

export default router
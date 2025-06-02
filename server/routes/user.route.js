import { Router } from "express";
import { getUserData, userEnrolledCourses, purchaseCourse, updateUserCourseProgress, getUserCourseProgress, userRating } from "../controllers/user.controller.js";

const router = Router()

router.route("/data").get(getUserData)
router.route("/enrolled-courses").get(userEnrolledCourses)
router.route("/purchase").post(purchaseCourse)
router.route("/update-course-progress").post(updateUserCourseProgress)
router.route("/get-course-progress").post(getUserCourseProgress)
router.route("/add-rating").post(userRating)


export default router
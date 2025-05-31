import { Router } from "express";
import { updateRoleToEducator, addCourse, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData } from "../controllers/educator.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { protectEducator } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/update-role').post(updateRoleToEducator)
router.route('/add-course').post(upload.single('image'), protectEducator, addCourse)
router.route('/courses').get(protectEducator,getEducatorCourses)
router.route('/dashboard').get(protectEducator, educatorDashboardData)
router.route('/enrolled-students').get(protectEducator, getEnrolledStudentsData)

export default router;
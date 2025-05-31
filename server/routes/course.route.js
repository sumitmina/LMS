import { Router } from "express";
import { getAllCourses, getCourseById } from "../controllers/course.controller.js";

const router = Router()

router.route('/all').get(getAllCourses)
router.route('/:id').get(getCourseById)

export default router
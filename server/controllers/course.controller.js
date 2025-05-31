import { Course } from "../models/course.model.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// get all courses which are published
const getAllCourses = asyncHandler( async (req,res) => {
    try{
        const courses = await Course.find({isPublished: true}).select([
            "-courseContent", "-enrolledStudents"]).populate({path: "educator"})

        res.status(200).json(
            new ApiResponse(200,courses, "All courses fetched successfully")
        )
    }catch(err){
        throw new ApiError(500,"There is some error while fetching all courses")
    }
})

// get course by Id
const getCourseById = asyncHandler( async (req,res) => {
    try{
        const {id} = req.params
        const courseData = await Course.findById(id).populate({path: "educator"})

        // remove lecture url if isPreview : false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = ""
                }
            })
        })

        res.status(200).json(
            new ApiResponse(200,courseData, "Course fetched successfully by Id")
        )
    }catch(err){
        throw new ApiError(500, "Error while fetching the course by Id")
    }
})




export {
    getAllCourses,
    getCourseById
}
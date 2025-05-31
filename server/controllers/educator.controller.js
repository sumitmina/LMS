import { clerkClient } from '@clerk/express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Course } from '../models/course.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Purchase } from '../models/purchase.model.js';

// to update role to educator
const updateRoleToEducator = asyncHandler( async (req,res) => {
    try{
        const userId = req.auth.userId;
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        })

        res.status(200).json(
            new ApiResponse(200,{},"You can now publish a course") 
        )
    }
    catch(err){
        throw new ApiError(500,"There is a problem while updating the role")
    }
})

// add new course
const addCourse = asyncHandler( async (req,res) => {
    try{
        const {courseData} = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if(!imageFile){
            throw new ApiError(400,"Couse thumbnail is necessary field!!!")
        }

        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        const newCourse = await Course.create(parsedCourseData)
        const imageUpload = await uploadOnCloudinary(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()

        res.status(200).json(
            new ApiResponse(200, newCourse, "Course Added")
        )

    }
    catch(err){
        throw new ApiError(500,"There is a problem while adding the course") //if any error you can just check thr error by replacing the error message with err.message
    }
})

// get all courses of educator
const getEducatorCourses = asyncHandler ( async (req,res) => {
    try{
        const educator = req.auth.userId
        const allCourses = await Course.find({educator})
        res.status(200).json(
            new ApiResponse(200,allCourses,"all courses fetched successfully")
        )
    }catch(err){
        throw new ApiError(500,"There is a problem while fetching all courses")
    }
})

// fetch educator dashboard data i.e. {totalEarning, enrolled students, no. of courses}
const educatorDashboardData = asyncHandler( async (req,res) => {
    try{
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        const totalCourses = courses.length

        const courseIds = courses.map((course) => course._id)

        // calculate total earnings from the purchases
        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        })

        const totalEarning = purchases.reduce((sum,purchase) => sum + purchase.amount, 0)

        // collect unique enrolled student Ids with their course title
        const enrolledStudentsData = []
        for(const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle : course.courseTitle,
                    student
                })
            })
        }

        // res.status(200).json(
        //     new ApiResponse(200,{totalEarning, enrolledStudentsData, totalCourses},"")
        // )
        // try above code later

        res.json({success: true, dashboardData: {
            totalEarning, enrolledStudentsData, totalCourses
        }})

    }catch(err){
        throw new ApiError(500, "Something went wrong while fetching educator dashboard data")
    }
})

// get enrolled students data with purchase data
const getEnrolledStudentsData = asyncHandler(async (req,res) => {
    try{
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: {$in : courseIds},
            status: 'completed'
        }).populate('userId','name imageUrl').populate('courseId','courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }))

        res.status(200).json(
            new ApiResponse(200,enrolledStudents,"")
        )

    }catch(err){
        throw new ApiError(500, "Error while fetching enrolled students data")
    }
})


export {
    updateRoleToEducator,
    addCourse,
    getEducatorCourses,
    educatorDashboardData,
    getEnrolledStudentsData
}
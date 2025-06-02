import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Purchase } from "../models/purchase.model.js";
import Stripe from "stripe"
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";

// get user data
const getUserData = asyncHandler( async (req,res) => {
    try{
        const userId = req.auth.userId
        const user = await User.findById(userId)

        if(!user){
            throw new ApiError(400, "User not found")
        }

        res.status(200).json(
            new ApiResponse(200, user, "User data fetched successfully")
        )
    }catch(err){
        throw new ApiError(500, "Something went wrong while fetching user data")
    }
})

// users enrolled courses with lecture links
const userEnrolledCourses = asyncHandler( async (req,res) => {
    try{
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({
            success: true,
            enrolledCourses: userData.enrolledCourses
        })
    }catch(err){
        throw new ApiError(500, "Error while getting user's enrolled courses")
    }
})

// purchase course
const purchaseCourse = asyncHandler( async (req,res) => {
    try{
        const {courseId} = req.body
        const origin = req.get('origin');
        const userId = req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData || !courseData){
            throw new ApiError(400, "Data not found")
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)
        }

        const newPurchase = await Purchase.create(purchaseData)

        // stripe gateway initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()

        const line_items = [{
            price_data:{
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({
            success: true,
            session_url: session.url
        })
        
    }catch(err){
        throw new ApiError(500, err.message)
    }
})

// update user course progress
const updateUserCourseProgress = asyncHandler( async (req, res) => {
    try{
        const userId = req.auth.userId
        const {courseId, lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                res.status(200).json(
                    new ApiResponse(200,{},"Lecture Already Completed")
                )
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        }else{
            // create the progress data if is not present
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json(
            new ApiResponse(200, {}, 'progress updated')
        )
    }catch(err){
        throw new ApiError(500,err.message)
    }
})

// get user couse progress
const getUserCourseProgress = asyncHandler( async (req,res) => {
    try {
        const userId = req.auth.userId
        const {courseId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})
        res.status(200).json(
            new ApiResponse(200, progressData, "")
        )
    } catch (error) {
        throw new ApiError(error.message)
    }
})

// add user ratings to course
const userRating = asyncHandler( async (req,res) => {
    const userId = req.auth.userId
    const {courseId, rating} = req.body

    if(!userId){
        throw new ApiError(400,"UserId is mandatory")
    }
    if(!courseId){
        throw new ApiError(400,"Course Id is mandatory")
    }
    if(!rating){
        throw new ApiError(400, "Rating is not provided")
    }
    if(rating < 1 || rating > 5){
        throw new ApiError(400, "Rating is out of bound")
    }

    try{
        const course = await Course.findById(courseId)
        if(!course){
            throw new ApiError(400, "course not found")
        }

        const user = await User.findById(userId)
        if(!user || !user.enrolledCourses.includes(courseId)){
            throw new ApiError(400, "Invalid user or user not enrolled for this course")
        }

        // check if user already rated this course
        // if yes then find the index of that object
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        // if rating already exist then update the rating for the user
        if(existingRatingIndex > -1){
            course.courseRatings[existingRatingIndex].rating = rating;
        }else{
            course.courseRatings.push({
                userId,
                rating
            })
        }
        await course.save()

        res.status(200).json(
            new ApiResponse(200, {}, "Rating Updated")
        )
    }catch(err){
        throw new ApiError(500, err.message)
    }
})

export{
    getUserData,
    userEnrolledCourses,
    purchaseCourse,
    getUserCourseProgress,
    updateUserCourseProgress,
    userRating
}
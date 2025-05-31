import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Purchase } from "../models/purchase.model.js";
import Stripe from "stripe"
import { Course } from "../models/course.model.js";

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

export{
    getUserData,
    userEnrolledCourses,
    purchaseCourse
}
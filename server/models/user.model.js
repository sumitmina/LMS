import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        avatar: {
            type: String,
            required: true
        },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],

    },{
        timestamps: true
    }
)

export const User = mongoose.model("User",userSchema)
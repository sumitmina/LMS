// we are trying to add middleware that will check if the user is educator or not

import { clerkClient } from "@clerk/express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const protectEducator = asyncHandler(async (req,res,next) => {
    try{
        const userId = req.auth.userId
        const response = await clerkClient.users.getUser(userId)
        if(response.publicMetadata.role !== "educator"){
            throw new ApiError(400,"You are not a educator")
        }
        next()
    }catch(err){
        throw new ApiError(500,"Something went wrong")
    }
})

export {protectEducator}
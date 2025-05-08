import {Webhook} from "svix"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

export const clearkWebhooks = asyncHandler(async (req,res) => {
    try{
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        await whook.verify(JSON.stringify(req.body),{
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        //we can take the data from req body
        const {data, type} = req.body

        switch (type){
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    fullName: data.first_name + " " + data.last_name,
                    avatar: data.image_url
                }
                await User.create(userData)

                const createdUser = await User.findById(data.id);

                if(!createdUser){
                    throw new ApiError(500,"Somthing went wrong while registering the user");
                }

                res.status(200).json(
                    new ApiResponse(200,createdUser,"User registered successfully")
                )
                break;
            }
            case 'user.updated': {
                const updatedUserData = {
                    email: data.email_addresses[0].email_address,
                    fullName: data.first_name + " " + data.last_name,
                    avatar: data.image_url
                }
                await User.findByIdAndUpdate(data.id, updatedUserData)

                res.status(200).json(
                    new ApiResponse(200,{},"Updation successful")
                )
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);

                res.status(200).json(
                    new ApiResponse(200,{},"User deleted successfully")
                )
                break;
            }
        }
    }
    catch(err){
        throw new ApiError(500,err.message);
    }
})


import express from "express"
import cors from "cors"
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { clearkWebhooks, stripeWebhooks } from "./controllers/webHooks.controller.js";
import { clerkMiddleware } from "@clerk/express";

dotenv.config({
    path: "./.env"
})

const app = express();

//middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,  
}))
app.use(clerkMiddleware())


// connect to database
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("MongoDB connection failed",err);
})


// testing the app
app.get("/",(req,res)=>{
    res.send("API WORKING")
})


//user route
app.post('/clerk', express.json(), clearkWebhooks)

//educator routes
import educatorRouter from "./routes/educator.route.js"

app.use('/api/educator', express.json(), educatorRouter)

//course routes
import courseRouter from "./routes/course.route.js"

app.use('/api/course', express.json(), courseRouter)

// user routes
import userRouter from "./routes/user.route.js"

app.use('/api/user', express.json(), userRouter)
// we are using express.json() -> just to make sure that all requests will be passed in json format 

// stripe routes
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)
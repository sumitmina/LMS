import express from "express"
import cors from "cors"
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { clearkWebhooks } from "./controllers/webHooks.controller.js";

dotenv.config({
    path: "./.env"
})

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,  
}))

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

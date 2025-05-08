import express from "express"
import cors from "cors"

const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.get("/",(req,res)=>{
    res.send("API WORKING")
})

//routes import 
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users",userRouter);

export default app;


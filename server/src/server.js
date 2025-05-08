import connectDB from "./db/index.js";
import app from "./app.js";
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})


// connect to database
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("MongoDB connection failed",err);
})
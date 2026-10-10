const express=require("express");
const cors=require("cors");
require("dotenv").config();
const {connectDB}=require("./config/db");
const authRoutes=require("./router/authRoutes");
const newsRoutes=require("./router/newsRoutes");
const protect = require("./middleware/authmiddleware");
const app=express();
app.use(cors());
app.use(express.json());
connectDB();
app.use("/api/auth",authRoutes);
app.use("/api/news",newsRoutes);
app.get("/",(req,res)=>{
    res.json({
        message:"TruthLens AI server is running"
    });
});
const PORT=process.env.PORT || 5000;
app.get("/api/test-protected",protect,(req,res)=>{
    res.json({
        message:"Protected route working",
        user:req.user
    });
});
app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
});
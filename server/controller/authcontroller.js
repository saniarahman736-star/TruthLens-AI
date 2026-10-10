const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const{
    findUserByEmail,
    createUser
}=require("../models/usermodel");
const registerUser=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                message:"All fields are required"
            });
        }
        const existingUser=await findUserByEmail(email);
        if(existingUser){
            return res.status(400).json({
                message:"User already exists"
            });
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await createUser(
            name,email,hashedPassword
        );
        res.status(200).json({
            message:"User registered successfully",
            user
        });
    } catch(error){
        console.error("Registration error:",error);
        res.status(500).json({
            message:"Server error"
        });
    }
}
const loginUser=async(req,res)=>{
    try{
      const {email,password}=req.body;
      if(!email || !password){
        return res.status(400).json({
            message:"Email and password are required"
        });
      }
      const user=await findUserByEmail(email);
      if(!user){
        return res.status(400).json({
            message:"Invalid email or password"
        });
      }
      const isPasswordValid=await bcrypt.compare(
        password,
        user.password
      );
      if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid email or password"
        });
      }
      const token=jwt.sign(
        {
           userId:user.id,
           email:user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d"
        }
      );
      res.status(200).json({
        message:"Login successful",
        token,
        user:{
            id:user.id,
            name:user.name,
            email:user.email
        }
      });
    }catch(error){
         console.error("Login error:",error);
         res.status(500).json({
            message:"Server error"
         });
    }
}
module.exports={
    registerUser,loginUser
}
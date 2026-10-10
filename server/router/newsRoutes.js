const express=require("express");
const {
    submitNews,getMyAnalyses
}=require("../controller/newscontroller");
const protect=require("../middleware/authmiddleware");
const router=express.Router();
router.post("/",protect,submitNews);
router.get("/my",protect,getMyAnalyses);
module.exports=router;
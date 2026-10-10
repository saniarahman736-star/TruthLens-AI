const {Pool}=require("pg");
require("dotenv").config();
const pool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"truthlens_ai",
    password:process.env.DB_PASSWORD,
    port:5432,
});
const connectDB=async()=>{
    try{
      const client=await pool.connect();
      console.log("PostgreSQL connected successfully");
      client.release();
    }catch(error){
      console.error("PostgreSQL connection failed:",error.message);
    }
};
module.exports={pool,connectDB}
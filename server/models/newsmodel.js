const {pool}=require("../config/db");
const createNewsAnalysis=async(userId,headline,article)=>{
    const result=await pool.query(
        `INSERT INTO news_analysis
        (user_id,headline,article)
        VALUES($1,$2,$3)
        RETURNING *`,
        [userId,headline,article]
    );
    return result.rows[0];
};
const getNewsAnalysisByUser=async(userId)=>{
    const result=await pool.query(
        `SELECT *
        FROM news_analysis
        WHERE user_id =$1
        ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows
};
module.exports={
    createNewsAnalysis,
    getNewsAnalysisByUser
}
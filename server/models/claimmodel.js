const {pool}=require("../config/db");
const createClaim=async(
    analysisId,
    claim,
    verdict=null,
    explaination=null
)=>{
    const result=await pool.query(
        `INSERT INTO claims (analysis_id,claim,verdict,explanation)
        RETURNING *`
        [analysisId,claim,verdict,explaination]
    );
    return result.rows[0];
};
const getClaimsByAnalysis=async(analysisId)=>{
    const result=await pool.query(
        `SELECT * FROM claims WHERE analysis_id = $1 ORDER BY id ASC`,
        [analysisId]
    );
    return result.rows;
};
module.exports={
    createClaim,getClaimsByAnalysis
};
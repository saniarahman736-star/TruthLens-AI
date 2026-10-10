const {
    createNewsAnalysis,
}=require("../models/newsmodel");
const {
    analyzeNewsWithAI,
    extractClaimsWithAI,
    verifyClaimsWithAI,
    calculateOverallCredibility
}=require("../services/aiService");
const {
    verifyClaim,
}=require("../services/verificationService");
const submitNews=async(req,res)=>{
    try{
      const {headline,article}=req.body;
      if(!headline || !article){
        return res.status(400).json({
            message:"Headline and article are required"
        });
      }
      const aiResult=await analyzeNewsWithAI(
        headline,article
      );
      const analysis=await createNewsAnalysis(
        req.user.userId,
        headline,
        article
      );
      const {pool}=require("../config/db");
      const updatedAnalysis=await pool.query(
        `UPDATE news_analysis
         SET verdict=$1,
             confidence=$2,
             explanation=$3
         WHERE id=$4
         RETURNING * `,
         [
            aiResult.verdict,
            aiResult.confidence,
            aiResult.explanation,
            analysis.id
         ]
      );
      const claimResult=await extractClaimsWithAI(
        headline,article
      );
      const savedClaims=[];
      for(const item of claimResult.claims){
        const result=await pool.query(
            `INSERT INTO claims (analysis_id,claim) VALUES ($1,$2) RETURNING *`,
            [analysis.id,item.claim]
        );
        const verificationResult=await verifyClaim(item.claim);
        console.log("🔎Verification result:",verificationResult);
        const sources=[];
        for (const source of verificationResult.sources){
            await pool.query(
                `INSERT INTO sources (claim_id,title,url,credibility_score)
                VALUES($1,$2,$3,$4)`,
                [
                    result.rows[0].id,
                    source.title,
                    source.link,
                    source.credibilityScore
                ]
            );
            sources.push(source);
        }
        const claimVerification=await verifyClaimsWithAI(
            item.claim,sources
        );
        await pool.query(
            `UPDATE claims
            SET verdict=$1,
            explanation=$2
            WHERE id=$3`,
            [
                claimVerification.verdict,
                claimVerification.explanation,
                result.rows[0].id
            ]
        );
        savedClaims.push({
          ...result.rows[0],
          verdict:claimVerification.verdict,
          explanation:claimVerification.explanation
         });
      }
      const overallResult=calculateOverallCredibility(
        savedClaims
      );
      const finalAnalysis=await pool.query(
        `UPDATE news_analysis
        SET verdict=$1,
          confidence=$2,
          explanation=$3
        WHERE id=$4
        RETURNING *`,
        [
          overallResult.verdict,
          overallResult.score,
          `Overall credibility score:${overallResult.score}%.
           Based on the verification of ${savedClaims.length} factual claim(s).`,
           analysis.id
        ]
      );
      
      res.status(200).json({
        message:"News submitted successfully",
        analysis:finalAnalysis.rows[0],
        claims:savedClaims
      });
    }catch(error){
      console.error("News submission error:",error);
      res.status(500).json({
        message:"Server error"
      });
    }
}
const getMyAnalyses=async(req,res)=>{
    try{
      const {pool}=require("../config/db");
      const result=await pool.query(
        `SELECT *
        FROM news_analysis
        WHERE user_id=$1
        ORDER BY created_at DESC`,
        [req.user.userId]
      );
      res.status(200).json({
        analyses:result.rows
      });
    }catch(error){
      console.error("Get analyses error:",error);
      res.status(500).json({
        message:"Server error"
      });
    }
};
module.exports={
    submitNews,getMyAnalyses
}
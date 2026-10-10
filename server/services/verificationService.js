const axios = require("axios");
const verifyClaim = async (claim) => {
    try {
        const response = await axios.post(
            "https://api.serpkite.com/v1/search",
            {
                q: claim,
                country: "in",
                language: "en"
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SERPKITE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("🔎 Search results received");
        const sources=(response.data.results || []).map(source=>({
            ...source,
            credibilityScore:calculateSourceCredibility(source.domain)
        }));
        const claimCredibility=calculateClaimCredibility(sources);
        return {
            verdict: "Needs Verification",
            credibilityScore:claimCredibility,
            sources
        };

    } catch (error) {
        console.error(
            "Source verification error:",
            error.response?.data || error.message
        );

        throw new Error("Source verification failed");
    }
};
const calculateSourceCredibility=(domain)=>{
    if(!domain){
        return 30;
    }
    const highCredibility=[
        ".gov",
        ".gov.in",
        ".edu",
        ".ac.in",
        "reuters.com",
        "apnews.com",
        "bbc.com",
        "bbc.co.uk",
        "theguardian.com",
        "nytimes.com",
    ];
    const mediumCredibility=[
         "cnn.com",
        "npr.org",
        "aljazeera.com",
        "ndtv.com",
        "indianexpress.com",
        "hindustantimes.com"
    ];
    const normalizedDomain=domain
      .toLowerCase()
      .replace(/^www\./,"");
    const isHighCredibility=highCredibility.some(source=>
        normalizedDomain === source ||
        normalizedDomain.endsWith(source)
    );
    if(isHighCredibility){
        return 90;
    }
    const isMediumCredibility=mediumCredibility.some(source=>
        normalizedDomain === source ||
        normalizedDomain.endsWith(source)
    );
    if(isMediumCredibility){
        return 70;
    }
    return 50;
};
const calculateClaimCredibility=(sources)=>{
    if(!sources || sources.length === 0){
        return 0;
    }
    const totalScore=sources.reduce(
        (sum,source)=>sum+source.credibilityScore,0
    );
    return Math.round(totalScore/sources.length);
};
const calculateOverallCredibility=(claims)=>{
    if(!claims || claims.length === 0){
        return{
            credibilityScore:0,
            verdict:"Unverified"
        };
    }
    const supported=claims.filter(
        claim=>claim.verdict === "Supported"
    ).length;
    const conflicting=claims.filter(
        claim=>claim.verdict === "Conflicting"
    ).length;
    const score=Math.round(
        (supported/claims.length) * 100
    );
    let verdict;
    if(conflicting>supported){
        verdict="Likely Fake";
    } else if (score>=70){
        verdict="Likely Genuine";
    } else {
        verdict="Suspicious";
    }
    return {
        credibilityScore:score,
        verdict
    };
};
module.exports = {
    verifyClaim,calculateSourceCredibility,calculateClaimCredibility,calculateOverallCredibility
};
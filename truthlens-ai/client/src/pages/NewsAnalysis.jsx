import "./NewsAnalysis.css";
import { useState } from "react";
import { toast } from "react-toastify";
function NewsAnalysis() {
const [headline, setHeadline] = useState("");
const [article, setArticle] = useState("");
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const handleSubmit = async (e) => {
e.preventDefault();
const token = localStorage.getItem("token");
if (!token) {
  toast.error("Please log in to analyze news.");
  return;
}
try {
  setLoading(true);
  setResult(null);
  const response = await fetch("http://localhost:5000/api/news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ headline, article }),
  });
  const data = await response.json();
  if (!response.ok) {
    toast.error(data.message || "News analysis failed.");
    return;
  }
  setResult(data);
  toast.success("News analysis completed!");
} catch (error) {
  toast.error("Unable to connect to the server.");
} finally {
  setLoading(false);
}
};
const getVerdictClass=(verdict)=>{
  if(!verdict)
    return "unverified";
  const value=verdict.toLowerCase();
  if(
    value.includes("genuine") || 
    value === "supported"
  ) {
    return "genuine";
  }
  if(
    value.includes("fake") ||
    value === "conflicting"
  ){
    return "fake";
  }
  return "suspicious";
};
const analysis=result?.analysis;
const claims=result?.claims || [];
const validConfidence=Number(analysis?.confidence) || 0;
return (
<div className="analysis-page">
  <div className="analysis-container">
    <header className="analysis-header">
      <div className="analysis-brand">
        <span className="brand-icon">
          🔍
        </span>
        <span>TruthLens<strong></strong></span>
      </div>
      <h1>Discover the Truth Behind the News</h1>
      <p>Analyze news articles,examine factual claims and explore evidence with AI-powered fact-checking.</p>
    </header>
    <section className="analysis-card">
      <div className="section-heading">
        <span className="heading-icon">
          📰
        </span>
      </div>
      <h2>Submit a News Article</h2>
      <p>Enter the headline and the complete article below</p>
    <form onSubmit={handleSubmit}>
      <label>News Headline</label>
      <input
        id="headline"
        type="text"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Enter the news headline"
        required
        maxLength={500}
      />
      <label>News Article</label>
      <textarea
        id="article"
        value={article}
        onChange={(e) => setArticle(e.target.value)}
        placeholder="Paste the full news article here..."
        rows={8}
        required
        maxLength={300000}
      />
        <div className="character-count">
          {article.length}/300000
           characters
        </div>
        <button className="analyze-button"
        type="submit"
        disabled={loading}
        >
          {loading ? (
            <>
            <span className="loading-spinner" />
            Analyzing your news....
            </>
            ):(
              <>
              🔍 Analyze News
              </>
            )}
        </button>
        {loading && (
          <p className="loading-message">
            Examine the article and checking its factual claims.This may take a little while
          </p>
        )}
    </form>
    </section>
    {result && (
      <section className="results-section">
      <div className="results-title">
      <span>📊</span>
      <div>
        <h2>Analysis Report</h2>
        <p>Your news analysis results are ready</p>
      </div>
      </div>
      <div className="verdict-card">
      <div className="verdict-top">
      <p className="eyebrow">OVERALL VERDICT</p>
      <h3>{analysis?.verdict || "Unverified"}</h3>
      </div>
      <span className={`verdict-badge ${getVerdictClass(
    analysis?.verdict
  )}`}>
    {analysis?.verdict || "Unverified"}
  </span>
</div> 
      <div className="report-card">
      <div className="score-heading">
      <span>Credibility Score</span>
      <strong>{validConfidence}%
      </strong>
      </div>
      <div className="score-track"
      role="progressbar"
      aria-label="Credibility"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.max(0,Math.min(100,Number(analysis?.confidence) || 0)
      )}
      >
      <div className={`score-fill ${getVerdictClass(
        analysis?.verdict
      )}`}
      style={{
        width:`${
          Math.max(
            0,
            Math.min(
              100,
              Number(analysis?.confidence) || 0
            )
          )
        }%`,
      }}
    />
  </div>
  <p className="score-note">
  This score summarizes the claim-verification results.
  It is an indicator,not a guarantee of truth.
  </p>
  </div>
<div className="report-card">
<h3>📝 Analysis Explanation</h3>
<p className="explanation-text">
{analysis?.explanation || "No explanation was returned by the server."}
</p>
</div>
<div className="report-card">
<div className="claims-heading">
<div>
<h3>🔍Factual Claims</h3>
<p>Individual claims extracted from your article</p>
</div>
<span className="claims-count">
{claims.length}{claims.length === 1 ? "claim":"claims"}
</span>
</div>
{claims.length === 0 ? (
  <div className="empty-claims">
  <span>ⓘ</span>
  <p>No Factual Claims were returned for verification.The overall verdict may therefore be unverified.</p>
  </div>
):(
  <div className="claims-list">
  {claims.map((claim,index)=>(
    <article className="claim-item" key={claim.id || index}
    >
      <div className="claim-number">
        Claim {index+1}
      </div>
      <p className="claim-text">
        {claim.claim}
      </p>
      <div className="claim-verdict-row">
        <span className="claim-label">
          Verification
        </span>
           <span
  className={`verdict-badge ${getVerdictClass(
    claim.verdict || "Unverified"
  )}`}
>
  {claim.verdict || "Unverified"}
</span>
          </div>
          {claim.explanation && (
            <div className="claim-explanation">
            <strong>Explanation</strong>
            <p>{claim.explanation}</p>
            </div>
          )}
          {Array.isArray(claim.sources) && 
            claim.sources.length > 0 && (
              <div className="sources-section">
              <h4>Supporting Search Results</h4>
              {claim.sources.map((source,sourceIndex)=>(
                <div className="source-item"
                key={source.link || sourceIndex}
                >
                  <a href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                    {source.title || source.domain || "View source"}
                                  <span aria-hidden="true"> ↗</span>
                                </a>

                                {source.domain && (
                                  <span className="source-domain">
                                    {source.domain}
                                  </span>
                                )}

                                {source.snippet && (
                                  <p>{source.snippet}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </article>
                  ))}
                </div>
              )}
              </div>
            <div className="report-disclaimer">
            <span>⚠️</span>
              <p>
                AI-generated assessments can be inaccurate. Review the
                linked evidence and consult reliable official sources
                before sharing important news.
              </p>
            </div>

            <button
              className="reset-button"
              type="button"
              onClick={() => {
                setHeadline("");
                setArticle("");
                setResult(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Analyze Another Article
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
export default NewsAnalysis;
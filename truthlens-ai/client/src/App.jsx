import "./App.css";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {useState,useEffect} from "react";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import NewsAnalysis from "./pages/NewsAnalysis.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
function getLoginStatus(){
  return !!localStorage.getItem("token");
}
function App() {
  const [isLoggedIn,setIsLoggedIn]=useState(getLoginStatus
  );
  useEffect(()=>{
    const updatedLoginStatus=()=>{
      setIsLoggedIn(getLoginStatus());
    }
    window.addEventListener("authChanged",updatedLoginStatus);
    return ()=>{
      window.removeEventListener("authChanged",updatedLoginStatus);
  };
},[]);
return (
  <BrowserRouter>
   <Routes>
    <Route path="/" element={
<div className="app">
<nav className="navbar">
<a className="logo" href="#home">
<span className="logo-icon">🔎</span>
TruthLens<span className="logo-ai"> AI</span>
</a>
   <div className="nav-actions">
  {isLoggedIn ? (
    <button
      className="login-btn"
      onClick={() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/";
      }}
    >
      Logout
    </button>
  ) : (
    <>
      <button
        className="login-btn"
        onClick={() => (window.location.href = "/login")}
      >
        Login
      </button>
      <button
        className="signup-btn"
        onClick={() => (window.location.href = "/register")}
      >
        Get Started
      </button>
    </>
  )}
</div>
  </nav>
  <main>
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="eyebrow">
          <span className="status-dot"></span>
          AI-POWERED FACT CHECKING
        </div>

        <h1>
          Before you believe it,
          <br />
          <span>verify it.</span>
        </h1>

        <p className="hero-description">
          In a world full of information, discover the truth.
          Analyze news, examine factual claims, and explore
          supporting sources with TruthLens AI.
        </p>

        <div className="hero-actions">
          <button className="primary-btn"
          onClick={()=>
            window.location.href="/analyze"
          }>
            Start Fact-Checking <span>➡️</span>
          </button>

          <a className="secondary-btn" href="#how-it-works">
            Discover how it works
          </a>
        </div>

        <div className="trust-note">
          <span>✓</span> AI-assisted analysis
          <span>✓</span> Source-backed research
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-glow"></div>

        <div className="lens-card">
          <div className="lens-top">
            <div>
              <span className="mini-label">
                TRUTHLENS SCANNER
              </span>
              <h3>News Intelligence</h3>
            </div>
            <span className="scanner-icon">🔎</span>
          </div>

          <div className="scan-line"></div>

          <div className="news-preview">
            <span className="news-tag">SAMPLE ANALYSIS</span>
            <h4>Understanding today's headlines</h4>
            <p>
              Examine claims, review available evidence, and
              identify information that needs further verification.
            </p>
          </div>

          <div className="analysis-row">
            <div className="analysis-icon">🔎</div>
            <div>
              <strong>Claim detection</strong>
              <small>Identify factual statements</small>
            </div>
            <span className="check">✓</span>
          </div>

          <div className="analysis-row">
            <div className="analysis-icon source-icon">⭕</div>
            <div>
              <strong>Source investigation</strong>
              <small>Explore relevant search results</small>
            </div>
            <span className="check">✓</span>
          </div>

          <div className="lens-footer">
            <span className="footer-dot"></span>
            READY TO INVESTIGATE
            <span className="footer-mark">T/AI</span>
          </div>
        </div>

        <div className="floating-note note-top">
          <span>✳</span> Look beyond the headline
        </div>

        <div className="floating-note note-bottom">
          <span className="note-check">✓</span>
          Evidence matters.
        </div>
      </div>
    </section>

    <section className="features" id="about">
      <div className="section-heading">
        <span className="section-label">
          YOUR DIGITAL FACT-CHECKER
        </span>
        <h2>Clarity in an age of information overload.</h2>
        <p>
          Tools to help you question, investigate, and understand
          the news you encounter.
        </p>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <span className="feature-icon">🔎</span>
          <h3>AI News Analysis</h3>
          <p>
            Examine headlines and articles for factual claims,
            suspicious patterns, and missing context.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">⭕</span>
          <h3>Source Investigation</h3>
          <p>
            Explore relevant web sources and their baseline
            credibility scores.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">▤</span>
          <h3>Evidence-Based Results</h3>
          <p>
            Review claim verdicts, explanations, and available
            sources in one place.
          </p>
        </article>
      </div>
    </section>

    <section className="how-section" id="how-it-works">
      <span className="section-label">
        SIMPLE. CLEAR. INFORMATIVE.
      </span>

      <h2>From headline to insight.</h2>

      <div className="steps">
        <div>
          <span>01</span>
          <h3>Submit</h3>
          <p>Enter a headline and article.</p>
        </div>

        <div>
          <span>02</span>
          <h3>Investigate</h3>
          <p>AI extracts claims and searches for sources.</p>
        </div>

        <div>
          <span>03</span>
          <h3>Understand</h3>
          <p>Review the verdict and supporting explanations.</p>
        </div>
      </div>

      <p className="disclaimer">
        AI-generated assessments can be incorrect. Always review
        the available evidence and original sources before
        reaching a conclusion.
      </p>
    </section>
  </main>

  <footer>
    <a className="logo footer-logo" href="#home">
      🔎 TruthLens AI
    </a>
    <p>Question the headline. Investigate the evidence.</p>
    <span>© 2026 TruthLens AI</span>
  </footer>
</div>
    }
/>
<Route path="/register" element={<Register />} />
<Route path="/login" element={<Login />} />
<Route element={<ProtectedRoute />}>
<Route path="/analyze" element={<NewsAnalysis />} />
</Route>
</Routes>
</BrowserRouter>
)
}

export default App;
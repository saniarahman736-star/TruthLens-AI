import "./Login.css";
import {useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import {toast} from "react-toastify";
function Login(){
    const navigate=useNavigate();
    const [formData,setFormData]=useState({
        email:"",
        password:"",
    });
    const [loading,setLoading]=useState(false);
    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value,
        });
    };
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
          setLoading(true);
          const response=await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(formData),
            }
          );
          const data=await response.json();
          if(!response.ok){
            toast.error(data.message || "Invalid email or password");
            return;
          }
          if(data.token){
            localStorage.setItem("token",data.token);
            window.dispatchEvent(new Event("authChanged"));
          }
          toast.success("Login successful");
          setTimeout(()=>{
            navigate("/");
         },1000);
        }catch(error){
          toast.error("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    🔎 TruthLens
                <span>AI</span>
                </div>
                <h1>Welcome back</h1>
                <p className="login-subtitle">
                    Sign in to continue investigating the news with TruthLens AI.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                        type="email"
                        name="email" 
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                         />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                        type="password" 
                        name="password"
                        placeholder="Create a password"
                         value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                         />
                    </div>
                    <button type="submit"
                    className="login-submit-btn"
                    disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="register-text">
                    Don't have an account?{" "}
                    <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    )
}
export default Login;
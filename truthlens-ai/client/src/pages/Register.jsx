import "./Register.css";
import {useState} from "react";
import { useNavigate,Link } from "react-router-dom";
import {toast} from "react-toastify";
function Register(){
    const navigate=useNavigate();
    const [formData,setFormData]=useState({
        name:"",
        email:"",
        password:"",
    });
    const [loading,setLoading]=useState(false);
    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });
    };
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
         setLoading(true);
         const response=await fetch(
            "http://localhost:5000/api/auth/register",
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
            toast.error(data.message || "Registration failed");
            return;
         }
         toast.success("Registration successful!Please log in");
         setTimeout(()=>{
            navigate("/login");
         },1000);
        }catch(error){
          toast.error("Unable to connect to the server");
        } finally{
            setLoading(false);
        }
    }
    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-logo">
                    🔎 TruthLens
                <span>AI</span>
                </div>
                <h1>Create Your Account</h1>
                <p className="register-subtitle">
                    Join TruthLens AI and start investigating the news you read
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input 
                        type="text" 
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                         />
                    </div>
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
                    className="register-btn"
                    disabled={loading}>
                        {loading?"Create account..." : "Create Account"}
                    </button>
                </form>
                <p className="login-text">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    )
}
export default Register;
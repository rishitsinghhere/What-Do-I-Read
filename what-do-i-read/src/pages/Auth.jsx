import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as FaIcons from "react-icons/fa"; // Import all FontAwesome icons

export default function Auth(){
  const [mode, setMode] = useState("login");
  const { login, register } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (mode === "login") { 
        await login(email, password);
      } else { 
        await register(username, email, password);
      }
      nav("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="container-auth">
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div className="card" style={{padding:18}}>
          <h2 style={{margin:"6px 0"}}>{mode==="login" ? "Login" : "Register"}</h2>
          
          {error && (
            <div style={{
              color: "var(--danger, #dc3545)", 
              backgroundColor: "var(--danger-light, #f8d7da)", 
              padding: "8px 12px", 
              borderRadius: "4px", 
              marginBottom: "12px",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}
          
          <form className="form" onSubmit={submit}>
            {mode !== "login" && (
              <div className="form-row">
                <div className="label">Username</div>
                <input 
                  className="input" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  maxLength={15}
                  pattern="[a-zA-Z0-9]+"
                  title="Username can only contain letters and numbers (max 15 characters)"
                />
                <small style={{color: "var(--muted)", fontSize: "12px", marginTop: "4px"}}>
                  Max 15 characters, letters and numbers only
                </small>
              </div>
            )}
            <div className="form-row">
              <div className="label">Email</div>
              <input 
                className="input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                type="email" 
              />
            </div>
            <div className="form-row">
              <div className="label">Password</div>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  id="password-toggle"
                >
                  {showPassword ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
                </button>
              </div>

              {mode !== "login" && (
                <small style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </small>
              )}
            </div>
            <button 
              className="btn primary" 
              type="submit"
              disabled={isLoading}
              style={{marginTop:20}}
            >
              {isLoading ? "Please wait..." : (mode==="login"?"Login":"Create account")}
            </button>
          </form>
          <div className="row" style={{marginTop:25}}>
            <span className="muted">{mode==="login" ? "No account?" : "Already have an account?"}</span>
            <button 
              className="btn ghost" 
              onClick={() => {
                setMode(mode==="login"?"register":"login");
                setError("");
              }}
              disabled={isLoading}
            >
              {mode==="login" ? "Register" : "Login"}
            </button>
          </div>
        </div>
        <div className="card" style={{padding:18}}>
          <h3 style={{marginTop:6}}>Why create an account?</h3>
          <ul>
            <li>Save books to your Profile</li>
            <li>Track your reading progress</li>
            <li>Create Custom playlists</li>
          </ul>
        </div>
      </div>
    </div>  
  )
}
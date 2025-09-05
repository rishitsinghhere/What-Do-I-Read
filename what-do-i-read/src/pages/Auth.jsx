import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth(){
  const [mode, setMode] = useState("login");
  const { login, register } = useAuth();
  const nav = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const submit = (e)=>{
    e.preventDefault();
    if (mode==="login"){ login(email,password); }
    else { register(name,email,password); }
    nav("/profile");
  }

  return (

  <div class ="container-auth">
    <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div className="card" style={{padding:18}}>
        <h2 style={{margin:"6px 0"}}>{mode==="login" ? "Login" : "Register"}</h2>
        <form className="form" onSubmit={submit}>
          {mode!=="login" && (
            <div className="form-row">
              <div className="label">Name</div>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
          )}
          <div className="form-row">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required type="email" />
          </div>
          <div className="form-row">
            <div className="label">Password</div>
            <input className="input" value={password} onChange={e=>setPassword(e.target.value)} required type="password" />
          </div>
          <button className="btn primary" type="submit">{mode==="login"?"Login":"Create account"}</button>
        </form>
        <div className="row" style={{marginTop:10}}>
          <span className="muted">{mode==="login" ? "No account?" : "Already have an account?"}</span>
          <button className="btn ghost" onClick={()=>setMode(mode==="login"?"register":"login")}>
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as FaIcons from "react-icons/fa";

// AUTH PAGE - User login and registration with validation

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  if (!hasUpperCase) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!hasLowerCase) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!hasNumber) {
    return "Password must contain at least one number.";
  }
  if (!hasSpecialChar) {
    return "Password must contain at least one special character (e.g., !@#$).";
  }
  return null; // Password is valid
};

export default function Auth() {
  const [mode, setMode] = useState("login");
  const { login, register } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode !== "login") {
        const validationError = validatePassword(password);
        if (validationError) {
            setError(validationError);
            return;
        }
    }
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
  };

  return (
    <>
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="background-video">
        <source src="/Media/bgvideo3.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <div className="video-overlay"></div>

      <div className="container-auth">
        <div className="grid auth-grid">
          {/* Login/Register Form */}
          <div className="card auth-card">
            <h2 className="auth-title">
              {mode === "login" ? "Login" : "Register"}
            </h2>

            {/* Error Message */}
            {error && <div className="auth-error">{error}</div>}

            <form className="form" onSubmit={submit}>
              {/* Username Field */}
              {mode !== "login" && (
                <div className="form-row">
                  <div className="label">Username</div>
                  <input
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    maxLength={15}
                    pattern="[a-zA-Z0-9]+"
                    title="Username can only contain letters and numbers (max 15 characters)"
                  />
                  <small className="auth-username-hint">
                    Max 15 characters, letters and numbers only
                  </small>
                </div>
              )}

              {/* Email Field */}
              <div className="form-row">
                <div className="label">Email</div>
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>

              {/* Password Field */}
              <div className="form-row">
                <div className="label">Password</div>
                <div className="auth-password-container">
                  <input
                    className="input auth-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    id="password-toggle"
                  >
                    {showPassword ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
                  </button>
                </div>

                <small className="auth-password-hint">
                  Must be 8+ characters with uppercase, lowercase, number, and
                  special character
                </small>
              </div>

              {/* Submit Button */}
              <button
                className="btn primary auth-submit-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : "Create account"}
              </button>
            </form>

            {/* Toggle Mode Section */}
            <div className="row auth-toggle-section">
              <span className="muted">
                {mode === "login" ? "No account?" : "Already have an account?"}
              </span>
              <button
                className="btn ghost"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                disabled={isLoading}
              >
                {mode === "login" ? "Register" : "Login"}
              </button>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="card auth-card">
            <h3 className="auth-benefits-title">Why create an account?</h3>

            <div className="feature-card auth-benefit-card">
              <h3>Custom Libraries</h3>
              <p>Save books into libraries that match your vibe.</p>
            </div>

            <div className="feature-card auth-benefit-card">
              <h3>Smart Notes</h3>
              <p>Add personal notes & track your reading thoughts.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

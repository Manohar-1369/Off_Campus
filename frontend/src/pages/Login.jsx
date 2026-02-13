import { useState } from "react";

const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function Login({ onAuth, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (onAuth) {
        onAuth({
          studentId: data.studentId,
          token: data.token,
          resumeUrl: data.resumeUrl,
          resumeSkills: data.resumeSkills || []
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>Login</h3>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>

      <p className="auth-link">
        If you don7t have an account,{
        <button type="button" onClick={onSwitch}>sign up here</button>}
      </p>
    </div>
  );
}

export default Login;

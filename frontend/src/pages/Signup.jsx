import { useState } from "react";

const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function Signup({ onAuth, onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("AI/ML");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, domain })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      if (onAuth) {
        onAuth({
          studentId: data.studentId,
          token: data.token || null
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>Signup</h3>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

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

      <select value={domain} onChange={(e) => setDomain(e.target.value)}>
        <option>AI/ML</option>
        <option>Software</option>
        <option>Data</option>
        <option>Web</option>
      </select>
      <br /><br />

      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>

      <p className="auth-link">
        If you already have an account,
        <button type="button" onClick={onSwitch}>login here</button>.
      </p>
    </div>
  );
}

export default Signup;

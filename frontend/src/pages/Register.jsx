import { useState } from "react";

function Register({ setStudentId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("AI/ML");

  const registerStudent = async () => {
    const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const res = await fetch(`${apiBase}/students/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, domain })
    });

    const data = await res.json();
    setStudentId(data._id);
  };

  return (
    <div>
      <h3>Student Registration</h3>

      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <br /><br />

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br /><br />

      <select onChange={(e) => setDomain(e.target.value)}>
        <option>AI/ML</option>
        <option>Software</option>
      </select>
      <br /><br />

      <button onClick={registerStudent}>Register</button>
    </div>
  );
}

export default Register;

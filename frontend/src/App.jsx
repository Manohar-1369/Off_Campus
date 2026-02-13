import { useEffect, useState } from "react";
import Jobs from "./pages/Jobs";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [studentId, setStudentId] = useState(null);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem("studentId");
    const storedSkills = localStorage.getItem("resumeSkills");
    const storedHasResume = localStorage.getItem("hasResume");
    if (storedId) setStudentId(storedId);
    if (storedSkills) {
      try {
        setResumeSkills(JSON.parse(storedSkills));
      } catch {
        setResumeSkills([]);
      }
    }
    if (storedHasResume === "true") {
      setHasResume(true);
    }
  }, []);

  const handleAuth = ({ studentId: id, token, resumeSkills: skills, resumeUrl }) => {
    if (id) {
      localStorage.setItem("studentId", id);
      setStudentId(id);
    }
    if (token) {
      localStorage.setItem("authToken", token);
    }
    if (Array.isArray(skills)) {
      localStorage.setItem("resumeSkills", JSON.stringify(skills));
      setResumeSkills(skills);
    }
    if (resumeUrl) {
      localStorage.setItem("hasResume", "true");
      setHasResume(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("authToken");
    localStorage.removeItem("resumeSkills");
    localStorage.removeItem("hasResume");
    setStudentId(null);
    setResumeSkills([]);
    setHasResume(false);
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <h1>Off-Campus Opportunity Portal</h1>
          <p>Jobs matched by resume skills or your selected domain.</p>
        </div>

        {studentId && (
          <div className="top-actions">
            <a className="ghost-btn" href="#resume">Upload Resume</a>
            <button className="primary-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {!studentId ? (
        <div className="auth-grid">
          <p className="auth-hint">
            If you already have an account, login. If not, sign up.
          </p>

          {showLogin ? (
            <Login onAuth={handleAuth} onSwitch={() => setShowLogin(false)} />
          ) : (
            <Signup onAuth={handleAuth} onSwitch={() => setShowLogin(true)} />
          )}
        </div>
      ) : (
        <div className="dashboard">
          <Jobs studentId={studentId} resumeSkills={resumeSkills} />

          <div id="resume" className="panel resume-panel">
            <ResumeAnalyzer
              studentId={studentId}
              initialSkills={resumeSkills}
              initialHasResume={hasResume}
              onResumeSaved={(skills = []) => {
                localStorage.setItem("resumeSkills", JSON.stringify(skills));
                setResumeSkills(skills);
                localStorage.setItem("hasResume", "true");
                setHasResume(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

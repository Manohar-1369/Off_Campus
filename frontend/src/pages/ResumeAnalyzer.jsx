import { useState } from "react";
import axios from "axios";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Upload resume");

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/resume/analyze",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const matchJobs = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/jobs/match",
        { skills: result.skills }
      );
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      alert("Job matching failed");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🚀 AI Resume Analyzer</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <button onClick={handleUpload}>Analyze Resume</button>

      {loading && <p>Analyzing...</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>📊 Score: {result.score}/100</h3>

          <h4>💡 Skills</h4>
          <ul>
            {result.skills.map((s,i)=>(
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h4>🔥 Strengths</h4>
          <ul>
            {result.strengths.map((s,i)=>(
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h4>⚠️ Weaknesses</h4>
          <ul>
            {result.weaknesses.map((s,i)=>(
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h4>🎯 Suggested Roles</h4>
          <ul>
            {result.suggested_roles.map((s,i)=>(
              <li key={i}>{s}</li>
            ))}
          </ul>

          <br />

          <button onClick={matchJobs}>
            🔍 Match Jobs For Me
          </button>

          {/* ================= MATCHED JOBS ================= */}

          {jobs && jobs.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              
              {/* BEST MATCH */}
              <h2 style={{ color: "green" }}>
                ⭐ Best Match: {jobs[0].title}
              </h2>

              <h3>💼 Matched Jobs</h3>

              {jobs.map((job,i)=>(
                <div key={i} style={{
                  border: "1px solid #ccc",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "8px"
                }}>
                  <h4>{job.title}</h4>

                  <p><b>Company:</b> {job.company}</p>
                  <p><b>Domain:</b> {job.domain}</p>

                  <p>
                    <b>Match Score:</b> 
                    <span style={{
                      color:
                        job.score > 60 ? "green" :
                        job.score > 30 ? "orange" : "red",
                      fontWeight: "bold"
                    }}>
                      {" "}{job.score}%
                    </span>
                  </p>

                  <a href={job.applyLink} target="_blank">
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

}

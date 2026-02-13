import { useEffect, useState } from "react";
import axios from "axios";

export default function ResumeAnalyzer({ studentId, onResumeSaved, initialSkills = [], initialHasResume = false }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialHasResume) {
      setIsSaved(true);
      setResult({ skills: initialSkills });
    }
  }, [initialHasResume, initialSkills]);

  const handleSave = async () => {
    if (!file && !text.trim()) return alert("Upload resume or paste text");

    setLoading(true);

    try {
      let res;
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      if (file) {
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("studentId", studentId || "");
        res = await axios.post(
          `${apiBase}/api/resume/analyze`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post(
          `${apiBase}/api/resume/analyze`,
          { resumeText: text, studentId },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      setResult(res.data);
      setIsSaved(true);
      console.log("📄 Resume saved:", res.data);
      console.log("🎯 Extracted skills:", res.data.skills);
      
      if (onResumeSaved) {
        const skills = res.data.skills || [];
        console.log("📤 Sending skills to parent:", skills);
        onResumeSaved(skills);
      }
    } catch (err) {
      console.error(err);
      alert("Resume save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!isSaved) {
      return alert("Please save your resume first");
    }

    setAnalyzing(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const res = await axios.post(
        `${apiBase}/api/resume/detailed-analysis`,
        { studentId },
        { headers: { "Content-Type": "application/json" } }
      );
      setDetailedAnalysis(res.data);
      console.log("📊 Detailed analysis:", res.data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="resume-block">
      <div className="panel-header">
        <div>
          <h2>Upload Resume</h2>
          <p className="panel-subtext">Optional. If uploaded, matching improves.</p>
        </div>
      </div>

      <div className="resume-inputs">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <textarea
          rows="6"
          placeholder="Or paste your resume text here"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="resume-actions">
        <button className="primary-btn" onClick={handleSave} disabled={loading}>
          {loading ? "⏳ Saving..." : isSaved ? "Update Resume" : "Save Resume"}
        </button>
        <button 
          className="secondary-btn" 
          onClick={handleAnalyze} 
          disabled={!isSaved || analyzing}
        >
          {analyzing ? "🤖 Analyzing with AI..." : "Get Detailed Analysis"}
        </button>
      </div>

      {analyzing && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>🔍 Analyzing your resume against {detailedAnalysis?.jobAnalysis?.length || '20+'} jobs...</p>
          <p className="loading-subtext">Generating personalized roadmap with AI (this may take 15-30 seconds)</p>
        </div>
      )}

      {isSaved && result && (
        <div className="resume-results">
          <div className="result-row">
            <span>✅ Resume Saved</span>
            <strong>{result.skills?.length || 0} skills detected</strong>
          </div>
        </div>
      )}

      {detailedAnalysis && (
        <div className="detailed-analysis">
          <h3>📊 Detailed Job Analysis</h3>
          
          <div className="analysis-summary">
            <div className="summary-card">
              <span>Your Skills</span>
              <strong>{detailedAnalysis.userSkills?.length || 0}</strong>
            </div>
            <div className="summary-card">
              <span>Jobs Analyzed</span>
              <strong>{detailedAnalysis.jobAnalysis?.length || 0}</strong>
            </div>
            <div className="summary-card">
              <span>Best Match</span>
              <strong>{detailedAnalysis.bestMatch?.score || 0}%</strong>
            </div>
          </div>

          <div className="job-analysis-list">
            {detailedAnalysis.jobAnalysis?.map((job, idx) => (
              <div key={idx} className="job-analysis-card">
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <span className={`score-badge ${job.score >= 70 ? 'high' : job.score >= 40 ? 'medium' : 'low'}`}>
                    {job.score}%
                  </span>
                </div>
                <p className="job-company">{job.company} • {job.domain}</p>
                
                {job.missingSkills?.length > 0 && (
                  <div className="missing-skills">
                    <h5>Missing Skills:</h5>
                    <div className="skill-tags">
                      {job.missingSkills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <a href={job.applyLink} target="_blank" rel="noreferrer" className="apply-link">
                  Apply →
                </a>
              </div>
            ))}
          </div>

          {detailedAnalysis.learningRoadmap && (
            <div className="learning-roadmap">
              <h3>🎯 Learning Roadmap</h3>
              {detailedAnalysis.learningRoadmap.intro && detailedAnalysis.learningRoadmap.intro.includes('⚠️') && (
                <div className="quota-warning">
                  ⚠️ AI quota exceeded today. Showing curated roadmap instead.
                </div>
              )}
              <p className="roadmap-intro">{detailedAnalysis.learningRoadmap.intro}</p>
              
              {detailedAnalysis.learningRoadmap.skills?.map((skill, idx) => (
                <div key={idx} className="roadmap-skill">
                  <div className="skill-header">
                    <h4>{skill.name}</h4>
                    <span className="priority-badge">{skill.priority}</span>
                  </div>
                  <p>{skill.reason}</p>
                  <div className="resources">
                    <h5>Resources:</h5>
                    <ul>
                      {skill.resources?.map((resource, i) => (
                        <li key={i}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="timeline">⏱️ {skill.timeline}</p>
                  
                  {skill.projects && skill.projects.length > 0 && (
                    <div className="projects">
                      <h5>Practice Projects:</h5>
                      <ul>
                        {skill.projects.map((project, i) => (
                          <li key={i}>{project}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              
              {detailedAnalysis.learningRoadmap.careerAdvice && (
                <div className="career-advice">
                  <h4>💼 Career Advice</h4>
                  <p>{detailedAnalysis.learningRoadmap.careerAdvice}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

}

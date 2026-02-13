import { useEffect, useState } from "react";

function Jobs({ studentId, resumeSkills = [] }) {
  const [jobs, setJobs] = useState([]);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  // Fetch jobs
  useEffect(() => {
    if (!studentId) return;

    const hasSkills = Array.isArray(resumeSkills) && resumeSkills.length > 0;

    console.log("🔍 Jobs effect triggered:", { 
      studentId, 
      hasSkills, 
      skillCount: resumeSkills.length,
      skills: resumeSkills 
    });

    setJobsLoading(true);
    setJobsError("");

    const fetchJobs = async () => {
      try {
        if (hasSkills) {
          console.log("📊 Fetching matched jobs with skills:", resumeSkills);
          const res = await fetch("http://localhost:5000/api/jobs/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skills: resumeSkills })
          });
          const data = await res.json();
          console.log("✅ Matched jobs received:", data);
          setJobs(Array.isArray(data) ? data : []);
        } else {
          console.log("🏢 Fetching domain-based jobs for student:", studentId);
          const res = await fetch(`http://localhost:5000/students/${studentId}/jobs`);
          const data = await res.json();
          console.log("✅ Domain jobs received:", data);
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobs([]);
        setJobsError("Unable to load jobs right now.");
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, [studentId, resumeSkills]);

  // Fetch notification status
  useEffect(() => {
    if (!studentId) return;
    
    fetch(`http://localhost:5000/notifications/status/${studentId}`)
      .then((res) => res.json())
      .then((data) => setNotifyEnabled(data.notify))
      .catch((err) => console.error("Error fetching notification status:", err));
  }, [studentId]);

  const handleEnableNotifications = async () => {
    if (!studentId) {
      alert("Student ID is missing. Please register first.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/notifications/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });

      const data = await response.json();

      if (response.ok) {
        setNotifyEnabled(true);
        alert(
          data.emailSent 
            ? "✅ Notifications enabled! A test email has been sent to your inbox."
            : "✅ Notifications enabled! (Email delivery failed - check your settings)"
        );
      } else {
        alert("Failed to enable notifications: " + data.message);
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      alert("Error enabling notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!studentId) {
      alert("Student ID is missing. Please register first.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/notifications/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });

      const data = await response.json();

      if (response.ok) {
        setNotifyEnabled(false);
        alert("Notifications disabled.");
      } else {
        alert("Failed to disable notifications: " + data.message);
      }
    } catch (error) {
      console.error("Error disabling notifications:", error);
      alert("Error disabling notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel jobs-panel">
      <div className="panel-header">
        <div>
          <h2>Jobs Matched</h2>
          <p className="panel-subtext">
            Automatically shows jobs from your domain or resume skills.
          </p>
        </div>

        <div className="notify-toggle">
          <span className={`notify-pill ${notifyEnabled ? "on" : "off"}`}>
            {notifyEnabled ? "Notifications On" : "Notifications Off"}
          </span>
          <button
            className={notifyEnabled ? "danger-btn" : "success-btn"}
            onClick={notifyEnabled ? handleDisableNotifications : handleEnableNotifications}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : notifyEnabled
              ? "Disable"
              : "Enable"}
          </button>
        </div>
      </div>

      {jobsLoading ? (
        <p className="empty-state">Loading jobs...</p>
      ) : jobsError ? (
        <p className="empty-state">{jobsError}</p>
      ) : jobs.length === 0 ? (
        <p className="empty-state">Upload resume to see matched jobs.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job, index) => (
            <article key={job._id || job.id || index} className="job-card">
              <div className="job-card-header">
                <h4>{job.title}</h4>
                {typeof job.score === "number" && (
                  <span className="score-chip">{job.score}%</span>
                )}
              </div>
              <p className="job-meta">Domain: {job.domain}</p>
              {job.company && <p className="job-meta">Company: {job.company}</p>}
              <a
                href={job.applyLink}
                target="_blank"
                rel="noreferrer"
                className="apply-btn"
              >
                Apply Here
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Jobs;

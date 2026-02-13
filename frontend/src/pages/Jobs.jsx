import { useEffect, useState } from "react";

function Jobs({ studentId }) {
  const [jobs, setJobs] = useState([]);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch jobs
  useEffect(() => {
    if (!studentId) return;
    
    fetch(`http://localhost:5000/students/${studentId}/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, [studentId]);

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
        alert("Notifications enabled successfully!");
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
    <div style={{ padding: "20px" }}>
      {/* Notification Section */}
      <div
        style={{
          border: "2px solid #4CAF50",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
          backgroundColor: "#f9f9f9"
        }}
      >
        <h3 style={{ marginTop: 0, color: "#333" }}>📧 Email Notifications</h3>
        <p style={{ color: "#666", marginBottom: "15px" }}>
          Enable notifications to receive email alerts when new matching opportunities are discovered.
          <br />
          <small style={{ color: "#999" }}>
            The system automatically crawls and matches jobs to your domain. Notifications are sent only for new opportunities.
          </small>
        </p>
        <button
          onClick={notifyEnabled ? handleDisableNotifications : handleEnableNotifications}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "white",
            backgroundColor: notifyEnabled ? "#f44336" : "#4CAF50",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading
            ? "Processing..."
            : notifyEnabled
            ? "🔕 Disable Notifications"
            : "🔔 Enable Notifications"}
        </button>
        <span
          style={{
            marginLeft: "15px",
            fontWeight: "bold",
            color: notifyEnabled ? "#4CAF50" : "#999"
          }}
        >
          Status: {notifyEnabled ? "Enabled ✓" : "Disabled"}
        </span>
      </div>

      {/* Jobs Section */}
      <h3>Matched Opportunities</h3>

      {jobs.length === 0 ? (
        <p>No matching jobs found.</p>
      ) : (
        jobs.map((job) => (
          <div
            key={job._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              margin: "10px 0",
              padding: "15px",
              backgroundColor: "white"
            }}
          >
            <h4 style={{ marginTop: 0, color: "#333" }}>{job.title}</h4>
            <p style={{ margin: "5px 0" }}>
              <b>Domain:</b> {job.domain}
            </p>
            {job.company && (
              <p style={{ margin: "5px 0" }}>
                <b>Company:</b> {job.company}
              </p>
            )}
            <a
              href={job.applyLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#2196F3",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px"
              }}
            >
              Apply Here →
            </a>
          </div>
        ))
      )}
    </div>
  );
}

export default Jobs;

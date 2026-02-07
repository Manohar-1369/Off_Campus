import { useEffect, useState } from "react";

function Jobs({ studentId }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/students/${studentId}/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, [studentId]);

  return (
    <div>
      <h3>Matched Opportunities</h3>

      {jobs.length === 0 ? (
        <p>No matching jobs found.</p>
      ) : (
        jobs.map((job) => (
          <div key={job._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <h4>{job.title}</h4>
            <p><b>Domain:</b> {job.domain}</p>
            <a href={job.applyLink} target="_blank">Apply Here</a>
          </div>
        ))
      )}
    </div>
  );
}

export default Jobs;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import { useState } from "react";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";

function App() {
  const [studentId, setStudentId] = useState(null);

  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <h2>Off-Campus Opportunity Portal</h2>

        <Routes>
          <Route
            path="/"
            element={
              !studentId ? (
                <Register setStudentId={setStudentId} />
              ) : (
                <Jobs studentId={studentId} />
              )
            }
          />

          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import { useState } from "react";

function App() {
  const [studentId, setStudentId] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Off-Campus Opportunity Portal</h2>

      {!studentId ? (
        <Register setStudentId={setStudentId} />
      ) : (
        <Jobs studentId={studentId} />
      )}
    </div>
  );
}

export default App;

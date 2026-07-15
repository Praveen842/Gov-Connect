import React from "react";
import { Link } from "react-router-dom";

const BoardExamList = ({ board, exams }) => (
  <div className="panel" style={{ marginBottom: 18 }}>
    <h3 style={{ marginBottom: 12 }}>{board}</h3>
    <div className="list-card">
      {exams.length ? (
        <ul>
          {exams.map((exam) => (
            <li key={exam.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <strong>{exam.title}</strong>
                <div style={{ color: "#64748b", marginTop: 4 }}>
                  {exam.board} • {exam.notification_date || exam.date || "Date TBD"}
                </div>
              </div>
              <Link to={`/exams/${encodeURIComponent(exam.id)}`} className="secondary-outline-btn">
                Details
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No exams available for this board right now.</p>
      )}
    </div>
  </div>
);

export default BoardExamList;

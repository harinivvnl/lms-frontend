import { useEffect, useState } from "react";
import api from "../api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      setError("Access denied. Login with ADMIN account.");
      return;
    }

    const load = async () => {
      try {
        setError("");
        const [statsResponse, historyResponse] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/history")
        ]);
        setStats(statsResponse.data);
        setHistory(historyResponse.data || []);
      } catch (err) {
        if (!err.response) {
          setError("Backend not reachable. Start backend on port 8080.");
        } else if (err.response.status === 401) {
          setError("Please login first.");
        } else if (err.response.status === 403) {
          setError(err?.response?.data?.message || "Access denied. Login with ADMIN account.");
        } else {
          setError(err?.response?.data?.message || "Unable to load admin dashboard data.");
        }
      }
    };

    load();
  }, []);

  return (
    <div className="page">
      <div className="card wide">
        <h2>Admin Dashboard</h2>
        {error && <p className="error">{error}</p>}
        <div className="stats-chart">
          <div className="admin-switch">
            <div className="container">
              <div className="de">
                <div className="den">
                  <hr className="line" />
                  <hr className="line" />
                  <hr className="line" />

                  <div className="switch">
                    <label htmlFor="switch_pending"><span className="pending-label">PENDING</span></label>
                    <label htmlFor="switch_approved"><span className="approved-label">APPROVED</span></label>
                    <label htmlFor="switch_rejected"><span className="rejected-label">REJECTED</span></label>

                    <input type="radio" defaultChecked name="switch_admin" id="switch_pending" />
                    <input type="radio" name="switch_admin" id="switch_approved" />
                    <input type="radio" name="switch_admin" id="switch_rejected" />

                    <div className="light"><span /></div>
                    <div className="switch-dot"><span /></div>

                    <div className="dene">
                      <div className="denem">
                        <div className="deneme" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="stats">
            <div><span className="dot total" />All Requests: {stats.total}</div>
            <div><span className="dot pending" />Pending: {stats.pending}</div>
            <div><span className="dot approved" />Approved: {stats.approved}</div>
            <div><span className="dot rejected" />Rejected: {stats.rejected}</div>
          </div>
        </div>

        <h3>Request History</h3>
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Section</th>
                <th>Year</th>
                <th>Reason</th>
                <th>Dates</th>
                <th>Time</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Rejected By</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.studentUsername}</td>
                  <td>{item.department || "-"}</td>
                  <td>{item.section || "-"}</td>
                  <td>{item.year || "-"}</td>
                  <td>{item.reason}</td>
                  <td>{item.fromDate} - {item.toDate}</td>
                  <td>{item.fromTime && item.toTime ? `${item.fromTime} - ${item.toTime}` : "-"}</td>
                  <td>{item.status}</td>
                  <td>{item.approvedBy || (item.status === "APPROVED" ? (item.reviewedBy || "-") : "-")}</td>
                  <td>{item.rejectedBy || (item.status === "REJECTED" ? (item.reviewedBy || "-") : "-")}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="10">No history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

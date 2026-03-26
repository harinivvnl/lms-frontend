import { useEffect, useState } from "react";
import api from "../api.js";

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
    fromTime: "",
    toTime: ""
  });
  const [medicalForm, setMedicalForm] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
    attachment: null
  });
  const isEventReason = form.reason.trim().toUpperCase().includes("EVENT");

  const loadRequests = async () => {
    try {
      setError("");
      const response = await api.get("/api/leaves/mine");
      setRequests(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load leave requests.");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitRequest = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setSuccess("");
      const payload = {
        reason: form.reason,
        fromDate: form.fromDate,
        toDate: form.toDate,
        ...(isEventReason ? { fromTime: form.fromTime, toTime: form.toTime } : {})
      };
      await api.post("/api/leaves", payload);
      setForm({ reason: "", fromDate: "", toDate: "", fromTime: "", toTime: "" });
      setSuccess("Leave request submitted.");
      loadRequests();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to submit leave request.");
    }
  };

  const submitMedicalRegularization = async (event) => {
    event.preventDefault();
    const reasonText = medicalForm.reason.trim().toUpperCase();
    const validMedicalReason = reasonText.includes("MEDICAL")
      || reasonText.includes("NOT WELL")
      || reasonText.includes("UNWELL")
      || reasonText.includes("SICK")
      || reasonText.includes("FEVER")
      || reasonText.includes("ILL")
      || reasonText.includes("HEALTH")
      || reasonText.includes("HOSPITAL")
      || reasonText.includes("CLINIC")
      || reasonText.includes("DOCTOR");
    if (!validMedicalReason) {
      setError("This form is only for medical/not-well issues.");
      return;
    }
    if (!medicalForm.attachment) {
      setError("Please upload attachment (e.g., medical certificate).");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const formData = new FormData();
      formData.append("reason", medicalForm.reason);
      formData.append("fromDate", medicalForm.fromDate);
      formData.append("toDate", medicalForm.toDate);
      formData.append("attachment", medicalForm.attachment);
      await api.post("/api/leaves/medical-regularization", formData);
      setMedicalForm({ reason: "", fromDate: "", toDate: "", attachment: null });
      setSuccess("Medical regularization submitted.");
      loadRequests();
    } catch (err) {
      const responseMessage = err?.response?.data?.message
        || (typeof err?.response?.data === "string" ? err.response.data : "");
      setError(responseMessage || "Unable to submit medical regularization request.");
    }
  };

  const getStatusClassName = (status) => {
    if (status === "APPROVED") return "status-btn approved";
    if (status === "REJECTED") return "status-btn rejected";
    return "status-btn pending";
  };

  return (
    <div className="page">
      <div className="card wide">
        <h2>Student Dashboard</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="student-section-card">
          <h3>Regular Leave Request</h3>
          <form className="grid" onSubmit={submitRequest}>
          <input
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => {
              const nextReason = e.target.value;
              const nextIsEvent = nextReason.trim().toUpperCase().includes("EVENT");
              setForm({
                ...form,
                reason: nextReason,
                fromTime: nextIsEvent ? form.fromTime : "",
                toTime: nextIsEvent ? form.toTime : ""
              });
            }}
            required
          />
          {isEventReason && (
            <label>
              From Time
              <input
                type="time"
                value={form.fromTime}
                onChange={(e) => setForm({ ...form, fromTime: e.target.value })}
                required
              />
            </label>
          )}
          {isEventReason && (
            <label>
              To Time
              <input
                type="time"
                value={form.toTime}
                onChange={(e) => setForm({ ...form, toTime: e.target.value })}
                required
              />
            </label>
          )}
          <label>
            From
            <input
              type="date"
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
              required
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
              required
            />
          </label>
            <button
              type="submit"
              className={`button button-submit regular-submit-btn ${isEventReason ? "event-submit-next-row" : ""}`.trim()}
            >
            <div className="dots_border"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="sparkle"
            >
              <path
                className="path"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="black"
                fill="black"
                d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
              ></path>
              <path
                className="path"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="black"
                fill="black"
                d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
              ></path>
              <path
                className="path"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="black"
                fill="black"
                d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
              ></path>
            </svg>
            <span className="text_button">Submit</span>
            </button>
          </form>
        </div>

        <div className="student-section-card">
          <h3>Medical Regularization</h3>
          <form className="grid" onSubmit={submitMedicalRegularization}>
          <input
            placeholder="Reason (medical / not well)"
            value={medicalForm.reason}
            onChange={(event) => setMedicalForm({ ...medicalForm, reason: event.target.value })}
            required
          />
          <label>
            From
            <input
              type="date"
              value={medicalForm.fromDate}
              onChange={(event) => setMedicalForm({ ...medicalForm, fromDate: event.target.value })}
              required
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={medicalForm.toDate}
              onChange={(event) => setMedicalForm({ ...medicalForm, toDate: event.target.value })}
              required
            />
          </label>
          <label>
            Upload attachment (e.g., medical certificate)
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => setMedicalForm({ ...medicalForm, attachment: event.target.files?.[0] || null })}
              required
            />
          </label>
            <button type="submit" className="button button-submit medical-submit-btn">
            <div className="dots_border"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="sparkle"
            >
              <path
                className="path"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="black"
                fill="black"
                d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
              ></path>
              <path
                className="path"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="black"
                fill="black"
                d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
              ></path>
              <path
                className="path"
                strokeLinejoin="round"
                strokeLinecap="round"
                stroke="black"
                fill="black"
                d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
              ></path>
            </svg>
            <span className="text_button">Submit</span>
            </button>
          </form>
        </div>

        <div className="student-section-card">
          <h3>My Leave Requests</h3>
          <ul className="list student-request-list">
            {requests.map((item) => (
              <li key={item.id} className="student-request-card">
              {item.medicalRegularization ? "[Medical Regularization] " : ""}
              {item.reason} | {item.department} | {item.section} | Year {item.year} | {item.fromDate} - {item.toDate}
              {item.fromTime && item.toTime ? ` | ${item.fromTime} - ${item.toTime}` : ""} |
              {item.attachmentFileName ? ` Attachment: ${item.attachmentFileName} |` : ""}
              <button type="button" className={getStatusClassName(item.status)} disabled>
                {item.status}
              </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

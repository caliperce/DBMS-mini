import { useState } from "react";
import { ClipboardList, Plus, CheckCircle } from "lucide-react";
import { registrations, students, exams } from "../data/mockData";
import toast from "react-hot-toast";

export function RegistrationList() {
  const [examFilter, setExamFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [localRegs, setLocalRegs] = useState(registrations);

  const filtered = localRegs.filter((r) => {
    const matchExam = examFilter === "All" || r.exam_id === parseInt(examFilter);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchExam && matchStatus;
  });

  const handlePayment = (regId) => {
    setLocalRegs((prev) =>
      prev.map((r) =>
        r.registration_id === regId
          ? { ...r, fee_paid: 1, status: "Confirmed", payment_ref: `PAY${Date.now()}` }
          : r
      )
    );
    toast.success("Payment confirmed! Registration status updated to Confirmed.");
  };

  const confirmedForExam = examFilter !== "All"
    ? localRegs.filter((r) => r.exam_id === parseInt(examFilter) && r.status === "Confirmed")
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Registrations</div>
          <div className="page-subtitle">Manage student exam registrations</div>
        </div>
        <div className="flex gap-2 items-center">
          <a href="/registrations/add" className="btn btn-primary"><Plus size={15} /> Register Student</a>
        </div>
      </div>

      <div className="page-body">
        <div className="flex gap-3 items-center mb-4">
          <select className="form-select" style={{ width: "auto", minWidth: "180px" }}
            value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            <option value="All">All Exams</option>
            {exams.map((e) => <option key={e.exam_id} value={e.exam_id}>{e.exam_code}</option>)}
          </select>
          <select className="form-select" style={{ width: "auto", minWidth: "140px" }}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {["All", "Confirmed", "Pending", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
          </select>
          {confirmedForExam && (
            <div className="flex items-center gap-2" style={{ marginLeft: "auto" }}>
              <CheckCircle size={16} color="var(--success-600)" />
              <span className="text-sm" style={{ fontWeight: 600, color: "var(--success-700)" }}>
                {confirmedForExam.length} confirmed registrations
              </span>
            </div>
          )}
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg ID</th>
                <th>Student</th>
                <th>Exam</th>
                <th>Date</th>
                <th>Attempt</th>
                <th>Fee Paid</th>
                <th>Payment Ref</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state"><div className="empty-state-title">No registrations found</div></div></td></tr>
              ) : filtered.map((r) => {
                const student = students.find((s) => s.student_id === r.student_id);
                const exam = exams.find((e) => e.exam_id === r.exam_id);
                return (
                  <tr key={r.registration_id}>
                    <td className="font-mono text-xs">#{r.registration_id.toString().padStart(4, "0")}</td>
                    <td style={{ fontWeight: 500 }}>{student?.first_name} {student?.last_name}</td>
                    <td><span className="badge badge-primary">{exam?.exam_code}</span></td>
                    <td className="text-sm text-muted">{r.registration_date}</td>
                    <td className="text-center">{r.attempt_number}</td>
                    <td>
                      <span className={`badge ${r.fee_paid ? "badge-success" : "badge-warning"}`}>
                        {r.fee_paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-muted">{r.payment_ref || "-"}</td>
                    <td>
                      <span className={`badge ${r.status === "Confirmed" ? "badge-success" : r.status === "Pending" ? "badge-warning" : "badge-danger"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {!r.fee_paid && (
                        <button className="btn btn-success btn-sm" onClick={() => handlePayment(r.registration_id)}>
                          Confirm Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AddRegistration() {
  const [form, setForm] = useState({
    student_id: "", exam_id: "", fee_paid: "0", payment_ref: "",
    attempt_number: "1",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.student_id) e.student_id = "Student is required";
    if (!form.exam_id) e.exam_id = "Exam is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    const student = students.find((s) => s.student_id === parseInt(form.student_id));
    const exam = exams.find((ex) => ex.exam_id === parseInt(form.exam_id));
    toast.success(`${student?.first_name} ${student?.last_name} registered for ${exam?.exam_code}!`);
    setForm({ student_id: "", exam_id: "", fee_paid: "0", payment_ref: "", attempt_number: "1" });
    setErrors({});
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Register Student for Exam</div>
          <div className="page-subtitle">Create a new exam registration</div>
        </div>
      </div>
      <div className="page-body">
        <div className="form-section">
          <div className="card card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">Registration Details</div>
              <div className="form-grid mb-4">
                <div className="form-group">
                  <label className="form-label">Student <span className="required">*</span></label>
                  <select className="form-select" {...field("student_id")}>
                    <option value="">Select student...</option>
                    {students.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        #{s.student_id} - {s.first_name} {s.last_name} ({s.category})
                      </option>
                    ))}
                  </select>
                  {errors.student_id && <span className="form-error">{errors.student_id}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Exam <span className="required">*</span></label>
                  <select className="form-select" {...field("exam_id")}>
                    <option value="">Select exam...</option>
                    {exams.map((e) => (
                      <option key={e.exam_id} value={e.exam_id}>
                        {e.exam_code} - {e.exam_name}
                      </option>
                    ))}
                  </select>
                  {errors.exam_id && <span className="form-error">{errors.exam_id}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Attempt Number</label>
                  <input type="number" className="form-input" min="1" {...field("attempt_number")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fee Status</label>
                  <select className="form-select" {...field("fee_paid")}>
                    <option value="0">Unpaid</option>
                    <option value="1">Paid</option>
                  </select>
                </div>
                {form.fee_paid === "1" && (
                  <div className="form-group form-grid-full">
                    <label className="form-label">Payment Reference</label>
                    <input className="form-input" placeholder="e.g. PAY20240201001" {...field("payment_ref")} />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? "Registering..." : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

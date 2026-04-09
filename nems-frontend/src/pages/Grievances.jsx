import { useState } from "react";
import {
  AlertCircle, CheckCircle, Clock, MessageSquare, Plus, FileText,
} from "lucide-react";
import {
  grievances, students, results,
  getStudentById, getRegistrationById,
} from "../data/mockData";
import toast from "react-hot-toast";

function statusColor(status) {
  if (status === "Resolved") return "badge-success";
  if (status === "Under Review") return "badge-warning";
  return "badge-danger";
}

function statusIcon(status) {
  if (status === "Resolved") return <CheckCircle size={13} />;
  if (status === "Under Review") return <Clock size={13} />;
  return <AlertCircle size={13} />;
}

function typeColor(type) {
  if (type === "Result") return "badge-danger";
  if (type === "Registration") return "badge-warning";
  return "badge-primary";
}

export function FileGrievance() {
  const [form, setForm] = useState({
    student_id: "",
    result_id: "",
    grievance_type: "Result",
    description: "",
    filed_date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.student_id) e.student_id = "Student is required";
    if (!form.grievance_type) e.grievance_type = "Type is required";
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = "Description must be at least 20 characters";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    const student = getStudentById(parseInt(form.student_id));
    toast.success(`Grievance filed for ${student?.first_name} ${student?.last_name} — ID #${grievances.length + 1}`);
    setForm({
      student_id: "", result_id: "", grievance_type: "Result",
      description: "", filed_date: new Date().toISOString().slice(0, 10),
    });
    setErrors({});
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">File Grievance</div>
          <div className="page-subtitle">Submit a complaint regarding results, registration, or centre issues</div>
        </div>
        <a href="/grievances" className="btn btn-ghost">View All Grievances</a>
      </div>
      <div className="page-body">
        <div className="form-section">
          {/* Info banner */}
          <div style={{
            background: "var(--primary-50)",
            border: "1px solid var(--primary-200)",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            marginBottom: "24px",
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
          }}>
            <AlertCircle size={16} color="var(--primary-600)" style={{ marginTop: "1px", flexShrink: 0 }} />
            <div style={{ fontSize: "13px", color: "var(--primary-700)", lineHeight: 1.6 }}>
              Grievances are reviewed within 7 working days.
              Please provide accurate information and a detailed description of your concern.
              Grievance ID will be shared upon successful submission.
            </div>
          </div>

          <div className="card card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">Grievance Details</div>
              <div className="form-grid mb-4">
                <div className="form-group">
                  <label className="form-label">Student <span className="required">*</span></label>
                  <select className="form-select" {...field("student_id")}>
                    <option value="">Select student...</option>
                    {students.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        #{s.student_id} — {s.first_name} {s.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.student_id && <span className="form-error">{errors.student_id}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Grievance Type <span className="required">*</span></label>
                  <select className="form-select" {...field("grievance_type")}>
                    <option>Result</option>
                    <option>Registration</option>
                    <option>Centre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Related Result (optional)</label>
                  <select className="form-select" {...field("result_id")}>
                    <option value="">None / Not applicable</option>
                    {results.map((res) => {
                      const reg = getRegistrationById(res.registration_id);
                      const student = reg ? getStudentById(reg.student_id) : null;
                      return (
                        <option key={res.result_id} value={res.result_id}>
                          Result #{res.result_id} — {student?.first_name} {student?.last_name}
                          ({res.result_status}, {res.marks_obtained} marks)
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Filed Date</label>
                  <input type="date" className="form-input" {...field("filed_date")} />
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">Description <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: "120px" }}
                    placeholder="Describe your grievance in detail (minimum 20 characters)..."
                    {...field("description")}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    {errors.description
                      ? <span className="form-error">{errors.description}</span>
                      : <span />
                    }
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {form.description.length} characters
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => {
                  setForm({ student_id: "", result_id: "", grievance_type: "Result", description: "", filed_date: new Date().toISOString().slice(0, 10) });
                  setErrors({});
                }}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  <FileText size={15} /> {loading ? "Submitting..." : "File Grievance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OpenGrievances() {
  const [localGrievances, setLocalGrievances] = useState(grievances);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = localGrievances.filter((g) => {
    const matchStatus = statusFilter === "All" || g.status === statusFilter;
    const matchType = typeFilter === "All" || g.grievance_type === typeFilter;
    return matchStatus && matchType;
  });

  const handleResolve = (id) => {
    setLocalGrievances((prev) =>
      prev.map((g) =>
        g.grievance_id === id
          ? { ...g, status: "Resolved", resolved_date: new Date().toISOString().slice(0, 10), resolution_notes: "Resolved by administrator" }
          : g
      )
    );
    if (selected?.grievance_id === id) {
      setSelected((g) => ({ ...g, status: "Resolved" }));
    }
    toast.success(`Grievance #${id} marked as resolved`);
  };

  const openCount = localGrievances.filter((g) => g.status === "Open").length;
  const reviewCount = localGrievances.filter((g) => g.status === "Under Review").length;
  const resolvedCount = localGrievances.filter((g) => g.status === "Resolved").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Grievances</div>
          <div className="page-subtitle">Manage and resolve student complaints</div>
        </div>
        <a href="/grievances/add" className="btn btn-primary">
          <Plus size={15} /> File New Grievance
        </a>
      </div>
      <div className="page-body">
        {/* Summary counters */}
        <div className="flex gap-3 mb-6" style={{ flexWrap: "wrap" }}>
          {[
            { label: "Open", count: openCount, icon: AlertCircle, colorClass: "rose" },
            { label: "Under Review", count: reviewCount, icon: Clock, colorClass: "amber" },
            { label: "Resolved", count: resolvedCount, icon: CheckCircle, colorClass: "green" },
          ].map(({ label, count, icon: Icon, colorClass }) => (
            <div
              key={label}
              className="card"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: "1",
                minWidth: "160px",
                cursor: "pointer",
              }}
              onClick={() => setStatusFilter(statusFilter === label ? "All" : label)}
            >
              <div className={`stat-icon ${colorClass}`}><Icon size={18} /></div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{count}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center mb-4">
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "160px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {["All", "Open", "Under Review", "Resolved"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "160px" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {["All", "Result", "Registration", "Centre"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "var(--text-secondary)" }}>
            Showing {filtered.length} of {localGrievances.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="card card-body">
            <div className="empty-state">
              <AlertCircle size={36} className="empty-state-icon" />
              <div className="empty-state-title">No grievances found</div>
              <div className="empty-state-desc">No grievances match the selected filters</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((g) => {
              const student = getStudentById(g.student_id);
              return (
                <div
                  key={g.grievance_id}
                  className="card"
                  style={{
                    padding: "20px 24px",
                    borderLeft: `4px solid ${
                      g.status === "Resolved" ? "var(--success-500)"
                      : g.status === "Under Review" ? "var(--warning-500)"
                      : "var(--danger-500)"
                    }`,
                    cursor: "pointer",
                    transition: "var(--transition)",
                  }}
                  onClick={() => setSelected(g)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                        #G{g.grievance_id.toString().padStart(4, "0")}
                      </span>
                      <span className={`badge ${typeColor(g.grievance_type)}`}>{g.grievance_type}</span>
                      <span className={`badge ${statusColor(g.status)}`} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {statusIcon(g.status)} {g.status}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Filed: {g.filed_date}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                        {student?.first_name} {student?.last_name}
                        <span style={{ fontWeight: 400, color: "var(--text-secondary)", marginLeft: "6px", fontSize: "13px" }}>
                          (ID #{g.student_id})
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {g.description.length > 120 ? `${g.description.slice(0, 120)}...` : g.description}
                      </div>
                    </div>
                    {g.status !== "Resolved" && (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ flexShrink: 0 }}
                        onClick={(e) => { e.stopPropagation(); handleResolve(g.grievance_id); }}
                      >
                        <CheckCircle size={12} /> Resolve
                      </button>
                    )}
                  </div>
                  {g.resolution_notes && (
                    <div style={{
                      marginTop: "12px",
                      padding: "8px 12px",
                      background: "var(--success-50)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12px",
                      color: "var(--success-700)",
                    }}>
                      <strong>Resolution:</strong> {g.resolution_notes}
                      {g.resolved_date && ` (${g.resolved_date})`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "580px", width: "100%", padding: "32px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--radius-md)",
                  background: "var(--danger-50)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MessageSquare size={18} color="var(--danger-500)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px" }}>
                    Grievance #G{selected.grievance_id.toString().padStart(4, "0")}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Filed on {selected.filed_date}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${typeColor(selected.grievance_type)}`}>{selected.grievance_type}</span>
                <span className={`badge ${statusColor(selected.status)}`}>{selected.status}</span>
              </div>
            </div>

            <div className="form-grid" style={{ marginBottom: "20px" }}>
              {[
                ["Student", (() => { const s = getStudentById(selected.student_id); return s ? `${s.first_name} ${s.last_name}` : "Unknown"; })()],
                ["Student ID", `#${selected.student_id}`],
                ["Type", selected.grievance_type],
                ["Status", selected.status],
                ["Filed Date", selected.filed_date],
                ["Related Result ID", selected.result_id ? `#${selected.result_id}` : "N/A"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Description
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-primary)", background: "var(--bg-base)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                {selected.description}
              </div>
            </div>

            {selected.resolution_notes && (
              <div style={{
                padding: "12px 14px",
                background: "var(--success-50)",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                color: "var(--success-700)",
                marginBottom: "16px",
              }}>
                <strong>Resolution Note:</strong> {selected.resolution_notes}
                {selected.resolved_date && ` · Resolved on ${selected.resolved_date}`}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              {selected.status !== "Resolved" && (
                <button
                  className="btn btn-success"
                  onClick={() => { handleResolve(selected.grievance_id); setSelected(null); }}
                >
                  <CheckCircle size={14} /> Mark as Resolved
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

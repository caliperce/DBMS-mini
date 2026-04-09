import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, Plus, FileText } from "lucide-react";
import { api } from "../api";
import toast from "react-hot-toast";

function statusColor(s) { return s === "Resolved" ? "badge-success" : s === "Under Review" ? "badge-warning" : "badge-danger"; }
function statusIcon(s) { return s === "Resolved" ? <CheckCircle size={13} /> : <Clock size={13} />; }
function typeColor(t) { return t === "Result" ? "badge-danger" : t === "Registration" ? "badge-warning" : "badge-primary"; }

export function FileGrievance() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ student_id: "", result_id: "", grievance_type: "Result", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getStudents(), api.getResults()]).then(([s, r]) => { setStudents(s); setResults(r); });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.student_id) e.student_id = "Required";
    if (!form.description.trim() || form.description.trim().length < 20) e.description = "Min 20 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      await api.addGrievance({ student_id: +form.student_id, result_id: form.result_id ? +form.result_id : null, grievance_type: form.grievance_type, description: form.description });
      toast.success("Grievance filed!");
      setForm({ student_id: "", result_id: "", grievance_type: "Result", description: "" }); setErrors({});
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header"><div><div className="page-title">File Grievance</div><div className="page-subtitle">Submit a complaint</div></div><a href="/grievances" className="btn btn-ghost">View All</a></div>
      <div className="page-body"><div className="form-section">
        <div style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: "24px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <AlertCircle size={16} color="var(--primary-600)" style={{ marginTop: "1px", flexShrink: 0 }} />
          <div style={{ fontSize: "13px", color: "var(--primary-700)", lineHeight: 1.6 }}>Grievances are reviewed within 7 working days.</div>
        </div>
        <div className="card card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Grievance Details</div>
            <div className="form-grid mb-4">
              <div className="form-group"><label className="form-label">Student <span className="required">*</span></label>
                <select className="form-select" {...field("student_id")}><option value="">Select...</option>
                  {students.map((s) => <option key={s.student_id} value={s.student_id}>#{s.student_id} — {s.first_name} {s.last_name}</option>)}
                </select>{errors.student_id && <span className="form-error">{errors.student_id}</span>}
              </div>
              <div className="form-group"><label className="form-label">Type</label><select className="form-select" {...field("grievance_type")}><option>Result</option><option>Registration</option><option>Centre</option></select></div>
              <div className="form-group"><label className="form-label">Related Result</label>
                <select className="form-select" {...field("result_id")}><option value="">None</option>
                  {results.map((r) => <option key={r.result_id} value={r.result_id}>#{r.result_id} — {r.student_name} ({r.result_status}, {r.marks_obtained})</option>)}
                </select>
              </div>
              <div className="form-group form-grid-full"><label className="form-label">Description <span className="required">*</span></label>
                <textarea className="form-textarea" style={{ minHeight: "120px" }} placeholder="Min 20 characters..." {...field("description")} />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}><FileText size={15} /> {loading ? "Filing..." : "File Grievance"}</button>
            </div>
          </form>
        </div>
      </div></div>
    </div>
  );
}

export function OpenGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadGrievances = () => {
    api.getGrievances().then(setGrievances).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(loadGrievances, []);

  const filtered = grievances.filter((g) => {
    const ms = statusFilter === "All" || g.status === statusFilter;
    const mt = typeFilter === "All" || g.grievance_type === typeFilter;
    return ms && mt;
  });

  const handleResolve = async (id) => {
    try {
      await api.resolveGrievance(id, "Resolved by administrator");
      setGrievances((prev) => prev.map((g) => g.grievance_id === id ? { ...g, status: "Resolved" } : g));
      toast.success(`Grievance #${id} resolved`);
    } catch (e) { toast.error(e.message); }
  };

  const openCount = grievances.filter((g) => g.status === "Open").length;
  const reviewCount = grievances.filter((g) => g.status === "Under Review").length;
  const resolvedCount = grievances.filter((g) => g.status === "Resolved").length;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Grievances</div><div className="page-subtitle">Manage student complaints</div></div>
        <a href="/grievances/add" className="btn btn-primary"><Plus size={15} /> File New</a>
      </div>
      <div className="page-body">
        <div className="flex gap-3 mb-6" style={{ flexWrap: "wrap" }}>
          {[{ label: "Open", count: openCount, icon: AlertCircle, cls: "rose" }, { label: "Under Review", count: reviewCount, icon: Clock, cls: "amber" }, { label: "Resolved", count: resolvedCount, icon: CheckCircle, cls: "green" }].map(({ label, count, icon: Icon, cls }) => (
            <div key={label} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", flex: "1", minWidth: "160px", cursor: "pointer" }}
              onClick={() => setStatusFilter(statusFilter === label ? "All" : label)}>
              <div className={`stat-icon ${cls}`}><Icon size={18} /></div>
              <div><div style={{ fontSize: "22px", fontWeight: 700 }}>{count}</div><div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</div></div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 items-center mb-4">
          <select className="form-select" style={{ width: "auto", minWidth: "160px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {["All", "Open", "Under Review", "Resolved"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: "auto", minWidth: "160px" }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {["All", "Result", "Registration", "Centre"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "var(--text-secondary)" }}>Showing {filtered.length}</span>
        </div>
        {loading ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div> : filtered.length === 0 ? (
          <div className="card card-body"><div className="empty-state"><div className="empty-state-title">No grievances</div></div></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((g) => (
              <div key={g.grievance_id} className="card" style={{ padding: "20px 24px", borderLeft: `4px solid ${g.status === "Resolved" ? "var(--success-500)" : g.status === "Under Review" ? "var(--warning-500)" : "var(--danger-500)"}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">#G{String(g.grievance_id).padStart(4, "0")}</span>
                    <span className={`badge ${typeColor(g.grievance_type)}`}>{g.grievance_type}</span>
                    <span className={`badge ${statusColor(g.status)}`} style={{ display: "flex", alignItems: "center", gap: "4px" }}>{statusIcon(g.status)} {g.status}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Filed: {g.filed_date}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{g.student_name}<span className="text-sm text-muted" style={{ marginLeft: "6px" }}>(ID #{g.student_id})</span></div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{g.description?.length > 120 ? `${g.description.slice(0, 120)}...` : g.description}</div>
                  </div>
                  {g.status !== "Resolved" && <button className="btn btn-success btn-sm" style={{ flexShrink: 0 }} onClick={() => handleResolve(g.grievance_id)}><CheckCircle size={12} /> Resolve</button>}
                </div>
                {g.resolution_notes && (
                  <div style={{ marginTop: "12px", padding: "8px 12px", background: "var(--success-50)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--success-700)" }}>
                    <strong>Resolution:</strong> {g.resolution_notes} {g.resolved_date && `(${g.resolved_date})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

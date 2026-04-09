import { useState } from "react";
import { BookOpen, Plus, Clock, Users, CheckCircle } from "lucide-react";
import { exams } from "../data/mockData";
import toast from "react-hot-toast";

export function ExamList() {
  const [localExams] = useState(exams);
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  const filtered = localExams.filter((e) => {
    const q = query.toLowerCase();
    const matchQ = `${e.exam_name} ${e.exam_code} ${e.conducting_body}`.toLowerCase().includes(q);
    const matchL = levelFilter === "All" || e.exam_level === levelFilter;
    return matchQ && matchL;
  });

  const levelColor = (level) => {
    if (level === "National") return "badge-primary";
    if (level === "State") return "badge-warning";
    return "badge-gray";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Examinations</div>
          <div className="page-subtitle">All scheduled national examinations</div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="badge badge-primary">{localExams.length} exams</span>
          <a href="/exams/add" className="btn btn-primary"><Plus size={15} /> Add Exam</a>
        </div>
      </div>

      <div className="page-body">
        <div className="flex gap-3 items-center mb-4">
          <div className="search-bar">
            <input className="search-input" placeholder="Search exams..." style={{ paddingLeft: "12px" }}
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: "auto", minWidth: "140px" }}
            value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            {["All", "National", "State", "District"].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "18px" }}>
          {filtered.map((exam) => (
            <div key={exam.exam_id} className="card" style={{ transition: "var(--transition)" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
            >
              <div style={{ padding: "20px" }}>
                <div className="flex items-center justify-between mb-3">
                  <div style={{
                    background: "var(--primary-100)", borderRadius: "var(--radius-md)",
                    width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <BookOpen size={20} color="var(--primary-600)" />
                  </div>
                  <div className="flex gap-2">
                    <span className={`badge ${levelColor(exam.exam_level)}`}>{exam.exam_level}</span>
                    {exam.is_active ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-gray">Inactive</span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {exam.exam_name}
                </div>
                <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--primary-600)", marginBottom: "8px", fontWeight: 500 }}>
                  {exam.exam_code}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: 1.5 }}>
                  {exam.description}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conducting Body</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>{exam.conducting_body}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Marks</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>{exam.total_marks}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Passing Marks</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px", color: "var(--success-600)" }}>{exam.passing_marks}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={13} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Duration</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>{exam.duration_minutes} min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddExam() {
  const [form, setForm] = useState({
    exam_name: "", exam_code: "", conducting_body: "", total_marks: "",
    passing_marks: "", duration_minutes: "", exam_level: "National",
    description: "", is_active: "1",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.exam_name.trim()) e.exam_name = "Exam name is required";
    if (!form.exam_code.trim()) e.exam_code = "Exam code is required";
    if (!form.conducting_body.trim()) e.conducting_body = "Conducting body is required";
    if (!form.total_marks || isNaN(form.total_marks)) e.total_marks = "Valid total marks required";
    if (!form.passing_marks || isNaN(form.passing_marks)) e.passing_marks = "Valid passing marks required";
    if (!form.duration_minutes || isNaN(form.duration_minutes)) e.duration_minutes = "Valid duration required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success(`Exam "${form.exam_name}" added successfully!`);
    setForm({ exam_name: "", exam_code: "", conducting_body: "", total_marks: "", passing_marks: "", duration_minutes: "", exam_level: "National", description: "", is_active: "1" });
    setErrors({});
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Add Examination</div>
          <div className="page-subtitle">Create a new examination in the system</div>
        </div>
      </div>

      <div className="page-body">
        <div className="form-section">
          <div className="card card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">Exam Details</div>
              <div className="form-grid mb-4">
                <div className="form-group form-grid-full">
                  <label className="form-label">Exam Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. Joint Entrance Examination" {...field("exam_name")} />
                  {errors.exam_name && <span className="form-error">{errors.exam_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Code <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. JEE2024" {...field("exam_code")} />
                  {errors.exam_code && <span className="form-error">{errors.exam_code}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Conducting Body <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. NTA" {...field("conducting_body")} />
                  {errors.conducting_body && <span className="form-error">{errors.conducting_body}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Level</label>
                  <select className="form-select" {...field("exam_level")}>
                    <option>National</option><option>State</option><option>District</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" {...field("is_active")}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Brief description of the examination" {...field("description")} />
                </div>
              </div>

              <div className="form-section-title">Marks & Duration</div>
              <div className="form-grid-3 mb-6">
                <div className="form-group">
                  <label className="form-label">Total Marks <span className="required">*</span></label>
                  <input type="number" className="form-input" placeholder="e.g. 300" {...field("total_marks")} />
                  {errors.total_marks && <span className="form-error">{errors.total_marks}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Marks <span className="required">*</span></label>
                  <input type="number" className="form-input" placeholder="e.g. 90" {...field("passing_marks")} />
                  {errors.passing_marks && <span className="form-error">{errors.passing_marks}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes) <span className="required">*</span></label>
                  <input type="number" className="form-input" placeholder="e.g. 180" {...field("duration_minutes")} />
                  {errors.duration_minutes && <span className="form-error">{errors.duration_minutes}</span>}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" className="btn btn-ghost">Reset</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? "Saving..." : "Add Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

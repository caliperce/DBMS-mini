import { useState, useEffect } from "react";
import { BookOpen, Plus, Clock } from "lucide-react";
import { api } from "../api";
import toast from "react-hot-toast";

export function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExams().then(setExams).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Examinations</div><div className="page-subtitle">Active national examinations</div></div>
        <a href="/exams/add" className="btn btn-primary"><Plus size={15} /> Add Exam</a>
      </div>
      <div className="page-body">
        {loading ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "18px" }}>
            {exams.map((e) => (
              <div key={e.exam_id} className="card" style={{ padding: "24px" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--primary-500), var(--primary-400))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen size={22} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "16px" }}>{e.exam_name}</div>
                    <div className="text-sm text-muted">{e.exam_code} | {e.conducting_body}</div>
                  </div>
                  <span className={`badge ${e.is_active ? "badge-success" : "badge-gray"}`}>{e.is_active ? "Active" : "Inactive"}</span>
                </div>
                {e.description && <div className="text-sm text-muted mb-3">{e.description}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Marks</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary-700)", marginTop: "2px" }}>{e.total_marks}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pass Marks</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--success-600)", marginTop: "2px" }}>{e.passing_marks}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Duration</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "4px" }} className="flex items-center gap-1"><Clock size={13} /> {e.duration_minutes} min</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AddExam() {
  const [form, setForm] = useState({ exam_name: "", exam_code: "", conducting_body: "", total_marks: "", passing_marks: "", duration_minutes: "", exam_level: "National", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.exam_name.trim()) e.exam_name = "Required";
    if (!form.exam_code.trim()) e.exam_code = "Required";
    if (!form.conducting_body.trim()) e.conducting_body = "Required";
    if (!form.total_marks || isNaN(form.total_marks)) e.total_marks = "Required";
    if (!form.passing_marks || isNaN(form.passing_marks)) e.passing_marks = "Required";
    if (!form.duration_minutes || isNaN(form.duration_minutes)) e.duration_minutes = "Required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      await api.addExam({ ...form, total_marks: +form.total_marks, passing_marks: +form.passing_marks, duration_minutes: +form.duration_minutes });
      toast.success(`Exam "${form.exam_code}" added!`);
      setForm({ exam_name: "", exam_code: "", conducting_body: "", total_marks: "", passing_marks: "", duration_minutes: "", exam_level: "National", description: "" });
      setErrors({});
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Add Exam</div><div className="page-subtitle">Create a new examination</div></div></div>
      <div className="page-body"><div className="form-section"><div className="card card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Exam Details</div>
          <div className="form-grid mb-4">
            <div className="form-group form-grid-full"><label className="form-label">Exam Name <span className="required">*</span></label><input className="form-input" placeholder="e.g. Joint Entrance Examination" {...field("exam_name")} />{errors.exam_name && <span className="form-error">{errors.exam_name}</span>}</div>
            <div className="form-group"><label className="form-label">Exam Code <span className="required">*</span></label><input className="form-input" placeholder="e.g. JEE2025" {...field("exam_code")} />{errors.exam_code && <span className="form-error">{errors.exam_code}</span>}</div>
            <div className="form-group"><label className="form-label">Conducting Body <span className="required">*</span></label><input className="form-input" placeholder="e.g. NTA" {...field("conducting_body")} />{errors.conducting_body && <span className="form-error">{errors.conducting_body}</span>}</div>
            <div className="form-group"><label className="form-label">Total Marks <span className="required">*</span></label><input type="number" className="form-input" {...field("total_marks")} />{errors.total_marks && <span className="form-error">{errors.total_marks}</span>}</div>
            <div className="form-group"><label className="form-label">Passing Marks <span className="required">*</span></label><input type="number" className="form-input" {...field("passing_marks")} />{errors.passing_marks && <span className="form-error">{errors.passing_marks}</span>}</div>
            <div className="form-group"><label className="form-label">Duration (min) <span className="required">*</span></label><input type="number" className="form-input" {...field("duration_minutes")} />{errors.duration_minutes && <span className="form-error">{errors.duration_minutes}</span>}</div>
            <div className="form-group"><label className="form-label">Level</label><select className="form-select" {...field("exam_level")}><option>National</option><option>State</option><option>District</option></select></div>
            <div className="form-group form-grid-full"><label className="form-label">Description</label><textarea className="form-textarea" {...field("description")} /></div>
          </div>
          <div className="flex gap-3 justify-end"><button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? "Saving..." : "Add Exam"}</button></div>
        </form>
      </div></div></div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, Clock } from "lucide-react";
import { api } from "../api";
import toast from "react-hot-toast";

export function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);
  const [examFilter, setExamFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSchedules(), api.getExams()])
      .then(([s, e]) => { setSchedules(s); setExams(e); })
      .catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const filtered = schedules.filter((s) => examFilter === "All" || s.exam_id === parseInt(examFilter));
  const shiftColor = (shift) => shift === "Morning" ? "badge-primary" : shift === "Afternoon" ? "badge-warning" : "badge-gray";

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Schedules</div><div className="page-subtitle">Exam schedules and seat availability</div></div>
        <a href="/schedules/add" className="btn btn-primary"><Plus size={15} /> Add Schedule</a>
      </div>
      <div className="page-body">
        <div className="flex gap-3 items-center mb-4">
          <select className="form-select" style={{ width: "auto", minWidth: "180px" }} value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            <option value="All">All Exams</option>
            {exams.map((e) => <option key={e.exam_id} value={e.exam_id}>{e.exam_code}</option>)}
          </select>
        </div>
        {loading ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Exam</th><th>Centre</th><th>Date</th><th>Time</th><th>Hall</th><th>Shift</th><th>Seats</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.schedule_id}>
                    <td className="font-mono text-xs">#{s.schedule_id}</td>
                    <td><span className="badge badge-primary">{s.exam_code}</span></td>
                    <td style={{ fontWeight: 500 }}>{s.centre_name}</td>
                    <td className="text-sm">{s.exam_date}</td>
                    <td className="text-sm text-muted"><div className="flex items-center gap-1"><Clock size={12} /> {s.start_time} - {s.end_time}</div></td>
                    <td className="font-mono text-xs">{s.hall_number}</td>
                    <td><span className={`badge ${shiftColor(s.shift)}`}>{s.shift}</span></td>
                    <td><span style={{ fontWeight: 600, color: s.seats_available < 50 ? "var(--danger-500)" : "var(--success-600)" }}>{s.seats_available}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function AddSchedule() {
  const [exams, setExams] = useState([]);
  const [centres, setCentres] = useState([]);
  const [form, setForm] = useState({ exam_id: "", centre_id: "", exam_date: "", start_time: "", end_time: "", hall_number: "", seats_available: "", shift: "Morning" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getExams(), api.getCentres()]).then(([e, c]) => { setExams(e); setCentres(c); });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.exam_id) e.exam_id = "Required";
    if (!form.centre_id) e.centre_id = "Required";
    if (!form.exam_date) e.exam_date = "Required";
    if (!form.start_time) e.start_time = "Required";
    if (!form.end_time) e.end_time = "Required";
    if (!form.seats_available || isNaN(form.seats_available)) e.seats_available = "Required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      await api.addSchedule({ ...form, exam_id: +form.exam_id, centre_id: +form.centre_id, seats_available: +form.seats_available });
      toast.success("Schedule added!");
      setForm({ exam_id: "", centre_id: "", exam_date: "", start_time: "", end_time: "", hall_number: "", seats_available: "", shift: "Morning" }); setErrors({});
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Add Schedule</div><div className="page-subtitle">Schedule an exam at a centre</div></div></div>
      <div className="page-body"><div className="form-section"><div className="card card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Schedule Details</div>
          <div className="form-grid mb-4">
            <div className="form-group"><label className="form-label">Exam <span className="required">*</span></label><select className="form-select" {...field("exam_id")}><option value="">Select...</option>{exams.map((e) => <option key={e.exam_id} value={e.exam_id}>{e.exam_code}</option>)}</select>{errors.exam_id && <span className="form-error">{errors.exam_id}</span>}</div>
            <div className="form-group"><label className="form-label">Centre <span className="required">*</span></label><select className="form-select" {...field("centre_id")}><option value="">Select...</option>{centres.map((c) => <option key={c.centre_id} value={c.centre_id}>{c.centre_name}</option>)}</select>{errors.centre_id && <span className="form-error">{errors.centre_id}</span>}</div>
            <div className="form-group"><label className="form-label">Date <span className="required">*</span></label><input type="date" className="form-input" {...field("exam_date")} />{errors.exam_date && <span className="form-error">{errors.exam_date}</span>}</div>
            <div className="form-group"><label className="form-label">Shift</label><select className="form-select" {...field("shift")}><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div>
            <div className="form-group"><label className="form-label">Start Time <span className="required">*</span></label><input type="time" className="form-input" {...field("start_time")} />{errors.start_time && <span className="form-error">{errors.start_time}</span>}</div>
            <div className="form-group"><label className="form-label">End Time <span className="required">*</span></label><input type="time" className="form-input" {...field("end_time")} />{errors.end_time && <span className="form-error">{errors.end_time}</span>}</div>
            <div className="form-group"><label className="form-label">Hall Number</label><input className="form-input" placeholder="e.g. A101" {...field("hall_number")} /></div>
            <div className="form-group"><label className="form-label">Seats <span className="required">*</span></label><input type="number" className="form-input" {...field("seats_available")} />{errors.seats_available && <span className="form-error">{errors.seats_available}</span>}</div>
          </div>
          <div className="flex gap-3 justify-end"><button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? "Saving..." : "Add Schedule"}</button></div>
        </form>
      </div></div></div>
    </div>
  );
}

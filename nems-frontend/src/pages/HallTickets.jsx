import { useState, useEffect } from "react";
import { Ticket, Search, Printer, QrCode, CheckCircle, MapPin, Clock } from "lucide-react";
import { api } from "../api";
import toast from "react-hot-toast";

function HallTicketCard({ t }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", border: "2px solid var(--primary-200)", maxWidth: "680px" }}>
      <div style={{ background: "linear-gradient(135deg, var(--primary-600), var(--primary-500))", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "1px", textTransform: "uppercase" }}>NEMS — National Examination Management System</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>{t.exam_name}</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>{t.exam_code}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px" }}><QrCode size={48} color="#fff" /></div>
      </div>
      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div><div className="text-xs text-muted">Student Name</div><div style={{ fontSize: "16px", fontWeight: 600 }}>{t.student_name}</div></div>
          <div><div className="text-xs text-muted">Roll Number</div><div style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary-600)", fontFamily: "monospace" }}>{t.roll_number}</div></div>
          <div><div className="text-xs text-muted">Seat Number</div><div style={{ fontSize: "14px", fontWeight: 600 }}>{t.seat_number}</div></div>
          <div><div className="text-xs text-muted">Issued Date</div><div style={{ fontSize: "14px", fontWeight: 500 }}>{t.issued_date}</div></div>
        </div>
        <div style={{ marginTop: "20px", padding: "16px", background: "var(--gray-50)", borderRadius: "10px", border: "1px solid var(--gray-100)" }}>
          <div className="flex items-center gap-2 mb-2"><MapPin size={14} color="var(--primary-500)" /><span style={{ fontSize: "13px", fontWeight: 600 }}>Exam Centre</span></div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>{t.centre_name}</div>
          <div className="text-sm text-muted">{t.centre_city}</div>
          <div className="flex items-center gap-2 mt-3"><Clock size={14} color="var(--primary-500)" /><span style={{ fontSize: "13px", fontWeight: 600 }}>Schedule</span></div>
          <div className="text-sm"><strong>{t.exam_date}</strong> | {t.start_time} - {t.end_time} | Hall: <strong>{t.hall_number}</strong> | Shift: <strong>{t.shift}</strong></div>
        </div>
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="flex items-center gap-2"><CheckCircle size={16} color="var(--success-600)" /><span className="text-sm" style={{ color: "var(--success-700)", fontWeight: 600 }}>Valid Hall Ticket</span></div>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}><Printer size={14} /> Print</button>
        </div>
      </div>
    </div>
  );
}

export function GenerateHallTicket() {
  const [regs, setRegs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ registration_id: "", schedule_id: "", roll_number: "", seat_number: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getRegistrations(), api.getSchedules()]).then(([r, s]) => {
      setRegs(r.filter((rr) => rr.status === "Confirmed"));
      setSchedules(s);
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.registration_id) e.registration_id = "Required";
    if (!form.schedule_id) e.schedule_id = "Required";
    if (!form.roll_number.trim()) e.roll_number = "Required";
    if (!form.seat_number.trim()) e.seat_number = "Required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      await api.generateHallTicket({ registration_id: +form.registration_id, schedule_id: +form.schedule_id, roll_number: form.roll_number, seat_number: form.seat_number });
      toast.success(`Hall Ticket generated! Roll: ${form.roll_number}`);
      setForm({ registration_id: "", schedule_id: "", roll_number: "", seat_number: "" }); setErrors({});
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Generate Hall Ticket</div><div className="page-subtitle">Issue hall tickets for confirmed registrations</div></div></div>
      <div className="page-body"><div className="form-section"><div className="card card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Ticket Details</div>
          <div className="form-grid mb-4">
            <div className="form-group"><label className="form-label">Registration <span className="required">*</span></label>
              <select className="form-select" {...field("registration_id")}><option value="">Select...</option>
                {regs.map((r) => <option key={r.registration_id} value={r.registration_id}>#{r.registration_id} — {r.student_name} ({r.exam_code})</option>)}
              </select>{errors.registration_id && <span className="form-error">{errors.registration_id}</span>}
            </div>
            <div className="form-group"><label className="form-label">Schedule <span className="required">*</span></label>
              <select className="form-select" {...field("schedule_id")}><option value="">Select...</option>
                {schedules.map((s) => <option key={s.schedule_id} value={s.schedule_id}>{s.exam_code} — {s.centre_name} ({s.exam_date}, {s.shift})</option>)}
              </select>{errors.schedule_id && <span className="form-error">{errors.schedule_id}</span>}
            </div>
            <div className="form-group"><label className="form-label">Roll Number <span className="required">*</span></label><input className="form-input" placeholder="e.g. JEE2024-0001" {...field("roll_number")} />{errors.roll_number && <span className="form-error">{errors.roll_number}</span>}</div>
            <div className="form-group"><label className="form-label">Seat Number <span className="required">*</span></label><input className="form-input" placeholder="e.g. S-12" {...field("seat_number")} />{errors.seat_number && <span className="form-error">{errors.seat_number}</span>}</div>
          </div>
          <div className="flex gap-3 justify-end"><button type="submit" className="btn btn-primary btn-lg" disabled={loading}><Ticket size={15} /> {loading ? "Generating..." : "Generate Hall Ticket"}</button></div>
        </form>
      </div></div></div>
    </div>
  );
}

export function ViewHallTicket() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [tickets, setTickets] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => { api.getStudents().then(setStudents); }, []);

  const handleSearch = async () => {
    if (!studentId) { toast.error("Select a student"); return; }
    try {
      const t = await api.getHallTickets(studentId);
      setTickets(t);
      setSearched(true);
      if (t.length === 0) toast("No hall tickets found", { icon: "ℹ️" });
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="page-header"><div><div className="page-title">View Hall Tickets</div><div className="page-subtitle">Search and view student hall tickets</div></div></div>
      <div className="page-body">
        <div className="flex gap-3 items-end mb-6">
          <div className="form-group" style={{ flex: 1, maxWidth: "360px", marginBottom: 0 }}>
            <label className="form-label">Select Student</label>
            <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Choose student...</option>
              {students.map((s) => <option key={s.student_id} value={s.student_id}>#{s.student_id} - {s.first_name} {s.last_name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSearch}><Search size={15} /> Search</button>
        </div>
        {searched && tickets.length === 0 && <div className="empty-state" style={{ padding: "48px 0" }}><div className="empty-state-title">No hall tickets found</div></div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {tickets.map((t) => <HallTicketCard key={t.ticket_id} t={t} />)}
        </div>
      </div>
    </div>
  );
}

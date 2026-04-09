import { useState } from "react";
import {
  Ticket, Printer, Search, GraduationCap, MapPin, Calendar,
  CheckCircle, XCircle, QrCode,
} from "lucide-react";
import {
  hallTickets, registrations, schedules, exams,
  getStudentById, getExamById, getCentreById, getRegistrationById, getScheduleById,
} from "../data/mockData";
import toast from "react-hot-toast";

// Build enriched ticket data
function buildTicketView(ticket) {
  const reg = getRegistrationById(ticket.registration_id);
  if (!reg) return null;
  const student = getStudentById(reg.student_id);
  const exam = getExamById(reg.exam_id);
  const schedule = getScheduleById(ticket.schedule_id);
  const centre = schedule ? getCentreById(schedule.centre_id) : null;
  return { ticket, reg, student, exam, schedule, centre };
}

function HallTicketCard({ data, onPrint }) {
  const { ticket, student, exam, schedule, centre } = data;
  return (
    <div className="hall-ticket" id="hall-ticket-printable">
      <div className="hall-ticket-header">
        <div className="hall-ticket-logo">
          <GraduationCap size={26} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="hall-ticket-org-name">NEMS — National Examination</div>
          <div className="hall-ticket-org-sub">Management System | Government of India</div>
        </div>
        <div>
          <div className="hall-ticket-badge">Hall Ticket</div>
          <div style={{ textAlign: "right", marginTop: "6px" }}>
            <span
              className={`badge ${ticket.is_valid ? "badge-success" : "badge-danger"}`}
              style={{ fontSize: "10px" }}
            >
              {ticket.is_valid ? "Valid" : "Invalid"}
            </span>
          </div>
        </div>
      </div>

      {/* Exam name banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-700), var(--primary-500))",
        borderRadius: "var(--radius-md)",
        padding: "14px 20px",
        marginBottom: "20px",
        color: "#fff",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 600, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Examination
        </div>
        <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "3px" }}>{exam?.exam_name}</div>
        <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "2px" }}>{exam?.exam_code} · {exam?.conducting_body}</div>
      </div>

      {/* Candidate + Roll info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", marginBottom: "20px" }}>
        <div>
          <div className="hall-ticket-grid">
            {[
              ["Candidate Name", `${student?.first_name} ${student?.last_name}`],
              ["Student ID", `#${student?.student_id}`],
              ["Category", student?.category],
              ["Gender", student?.gender === "M" ? "Male" : "Female"],
              ["Issued Date", ticket.issued_date],
            ].map(([label, value]) => (
              <div key={label} className="hall-ticket-field">
                <div className="hall-ticket-field-label">{label}</div>
                <div className="hall-ticket-field-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
        {/* QR placeholder */}
        <div style={{
          width: 96,
          height: 96,
          background: "var(--primary-50)",
          border: "2px dashed var(--primary-300)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          flexShrink: 0,
        }}>
          <QrCode size={32} color="var(--primary-500)" />
          <div style={{ fontSize: "9px", color: "var(--primary-600)", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
            {ticket.qr_code}
          </div>
        </div>
      </div>

      {/* Roll number highlight */}
      <div className="hall-ticket-roll">
        <div className="hall-ticket-roll-label">Roll Number</div>
        <div className="hall-ticket-roll-number">{ticket.roll_number}</div>
      </div>

      {/* Exam details */}
      {schedule && (
        <div style={{
          marginTop: "18px",
          padding: "14px 18px",
          border: "1.5px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-base)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}>
          <div className="hall-ticket-field">
            <div className="hall-ticket-field-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={10} /> Exam Centre
            </div>
            <div className="hall-ticket-field-value">{centre?.centre_name}</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              {centre?.address}, {centre?.city}
            </div>
          </div>
          <div className="hall-ticket-field">
            <div className="hall-ticket-field-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={10} /> Exam Date &amp; Shift
            </div>
            <div className="hall-ticket-field-value">{schedule.exam_date}</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              {schedule.shift} · {schedule.start_time} – {schedule.end_time}
            </div>
          </div>
          <div className="hall-ticket-field">
            <div className="hall-ticket-field-label">Hall / Room</div>
            <div className="hall-ticket-field-value" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {schedule.hall_number}
            </div>
          </div>
          <div className="hall-ticket-field">
            <div className="hall-ticket-field-label">Seat Number</div>
            <div className="hall-ticket-field-value" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {ticket.seat_number}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: "18px",
        padding: "12px 16px",
        background: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: "var(--radius-md)",
        fontSize: "12px",
        color: "#92400e",
        lineHeight: 1.6,
      }}>
        <strong>Instructions:</strong> Candidates must bring this hall ticket along with a valid government-issued photo ID.
        Arrive at the exam centre at least 30 minutes before the start time.
        Electronic devices are not permitted inside the examination hall.
      </div>

      {onPrint && (
        <div className="flex gap-3 justify-end mt-4">
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <Printer size={14} /> Print Hall Ticket
          </button>
        </div>
      )}
    </div>
  );
}

export function GenerateHallTicket() {
  const [form, setForm] = useState({ registration_id: "", schedule_id: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  // Only show confirmed registrations without existing hall tickets
  const confirmedRegs = registrations.filter((r) => r.status === "Confirmed");
  const existingTicketRegIds = hallTickets.map((t) => t.registration_id);

  const validate = () => {
    const e = {};
    if (!form.registration_id) e.registration_id = "Registration is required";
    if (!form.schedule_id) e.schedule_id = "Schedule is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);

    const reg = getRegistrationById(parseInt(form.registration_id));
    const exam = getExamById(reg?.exam_id);
    const student = getStudentById(reg?.student_id);

    const newTicket = {
      ticket_id: hallTickets.length + 1,
      registration_id: parseInt(form.registration_id),
      schedule_id: parseInt(form.schedule_id),
      roll_number: `${exam?.exam_code}${String(Date.now()).slice(-6)}`,
      seat_number: `HALL-${Math.floor(Math.random() * 100 + 1).toString().padStart(3, "0")}`,
      issued_date: new Date().toISOString().slice(0, 10),
      is_valid: 1,
      qr_code: `QR_${exam?.exam_code}_${student?.student_id}`,
    };

    setGenerated(buildTicketView(newTicket));
    toast.success("Hall ticket generated successfully!");
    setForm({ registration_id: "", schedule_id: "" });
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
          <div className="page-title">Generate Hall Ticket</div>
          <div className="page-subtitle">Issue an admission ticket for a confirmed registration</div>
        </div>
      </div>
      <div className="page-body">
        {!generated ? (
          <div className="form-section">
            <div className="card card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-section-title">Ticket Details</div>
                <div className="form-grid mb-6">
                  <div className="form-group">
                    <label className="form-label">Registration <span className="required">*</span></label>
                    <select className="form-select" {...field("registration_id")}>
                      <option value="">Select confirmed registration...</option>
                      {confirmedRegs.map((r) => {
                        const student = getStudentById(r.student_id);
                        const exam = getExamById(r.exam_id);
                        const hasTicket = existingTicketRegIds.includes(r.registration_id);
                        return (
                          <option key={r.registration_id} value={r.registration_id} disabled={hasTicket}>
                            #{r.registration_id} — {student?.first_name} {student?.last_name} / {exam?.exam_code}
                            {hasTicket ? " (ticket already issued)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    {errors.registration_id && <span className="form-error">{errors.registration_id}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Schedule <span className="required">*</span></label>
                    <select className="form-select" {...field("schedule_id")}>
                      <option value="">Select schedule...</option>
                      {schedules.map((s) => {
                        const exam = getExamById(s.exam_id);
                        const centre = getCentreById(s.centre_id);
                        return (
                          <option key={s.schedule_id} value={s.schedule_id}>
                            {exam?.exam_code} — {centre?.centre_name} ({s.exam_date}, {s.shift})
                          </option>
                        );
                      })}
                    </select>
                    {errors.schedule_id && <span className="form-error">{errors.schedule_id}</span>}
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    <Ticket size={15} /> {loading ? "Generating..." : "Generate Hall Ticket"}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing tickets list */}
            <div className="card mt-6">
              <div className="card-header">
                <span className="card-title">Existing Hall Tickets</span>
                <span className="badge badge-primary">{hallTickets.length} issued</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Student</th>
                        <th>Exam</th>
                        <th>Roll Number</th>
                        <th>Seat</th>
                        <th>Issued</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hallTickets.map((t) => {
                        const d = buildTicketView(t);
                        if (!d) return null;
                        return (
                          <tr key={t.ticket_id}>
                            <td className="font-mono text-xs">#{t.ticket_id}</td>
                            <td style={{ fontWeight: 500 }}>{d.student?.first_name} {d.student?.last_name}</td>
                            <td><span className="badge badge-primary">{d.exam?.exam_code}</span></td>
                            <td className="font-mono text-xs">{t.roll_number}</td>
                            <td className="font-mono text-xs">{t.seat_number}</td>
                            <td className="text-sm text-muted">{t.issued_date}</td>
                            <td>
                              {t.is_valid
                                ? <span className="badge badge-success"><CheckCircle size={10} /> Valid</span>
                                : <span className="badge badge-danger"><XCircle size={10} /> Invalid</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ background: "var(--success-50)", borderRadius: "var(--radius-md)", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={18} color="var(--success-600)" />
                <span style={{ fontWeight: 600, color: "var(--success-700)" }}>Hall ticket generated successfully!</span>
              </div>
              <button className="btn btn-ghost" onClick={() => setGenerated(null)}>
                Generate Another
              </button>
            </div>
            <HallTicketCard data={generated} onPrint={true} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ViewHallTicket() {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!searchId.trim()) { toast.error("Enter a student ID"); return; }
    setSearched(true);
    const id = parseInt(searchId);
    // Find registrations for this student, then find their hall tickets
    const studentRegs = registrations.filter((r) => r.student_id === id);
    const regIds = studentRegs.map((r) => r.registration_id);
    const tickets = hallTickets.filter((t) => regIds.includes(t.registration_id));

    if (tickets.length === 0) {
      setResult([]);
    } else {
      setResult(tickets.map(buildTicketView).filter(Boolean));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">View Hall Ticket</div>
          <div className="page-subtitle">Search and view/print hall ticket by student ID</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card card-body" style={{ maxWidth: "480px", marginBottom: "28px" }}>
          <div className="form-section-title">Search by Student ID</div>
          <div className="flex gap-3 items-end">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Student ID</label>
              <div className="search-bar">
                <Search className="search-icon" />
                <input
                  className="search-input"
                  style={{ minWidth: 0, width: "100%", paddingLeft: "34px" }}
                  placeholder="e.g. 1"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleSearch}>
              <Search size={14} /> Search
            </button>
          </div>
          <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
            Available student IDs: 1 (Arjun), 2 (Priya), 3 (Rahul), 4 (Ananya), 5 (Vikram)
          </div>
        </div>

        {searched && result !== null && (
          result.length === 0 ? (
            <div className="card card-body">
              <div className="empty-state">
                <Ticket size={36} className="empty-state-icon" />
                <div className="empty-state-title">No hall tickets found</div>
                <div className="empty-state-desc">No hall tickets have been issued for Student ID: {searchId}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {result.map((data, idx) => (
                <HallTicketCard key={idx} data={data} onPrint={true} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

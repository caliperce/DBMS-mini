import { useState } from "react";
import { BarChart2, Trophy, Medal, TrendingUp } from "lucide-react";
import {
  results, registrations, exams,
  getStudentById, getExamById, getRegistrationById,
} from "../data/mockData";
import toast from "react-hot-toast";

function gradeColor(grade) {
  if (grade === "A") return "badge-success";
  if (grade === "B") return "badge-primary";
  if (grade === "C") return "badge-warning";
  return "badge-danger";
}

function statusColor(status) {
  if (status === "Pass") return "badge-success";
  if (status === "Fail") return "badge-danger";
  if (status === "Absent") return "badge-warning";
  return "badge-gray";
}

export function AddResult() {
  const [form, setForm] = useState({
    registration_id: "",
    marks_obtained: "",
    grade: "A",
    percentile: "",
    rank_position: "",
    result_status: "Pass",
    published_date: new Date().toISOString().slice(0, 10),
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Only confirmed registrations that don't have results yet
  const confirmedRegs = registrations.filter((r) => r.status === "Confirmed");
  const existingResultRegIds = results.map((r) => r.registration_id);

  const validate = () => {
    const e = {};
    if (!form.registration_id) e.registration_id = "Registration is required";
    if (!form.marks_obtained || isNaN(form.marks_obtained)) e.marks_obtained = "Valid marks required";
    if (!form.percentile || isNaN(form.percentile)) e.percentile = "Valid percentile required";
    if (!form.rank_position || isNaN(form.rank_position)) e.rank_position = "Valid rank required";
    if (!form.published_date) e.published_date = "Published date is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    const reg = getRegistrationById(parseInt(form.registration_id));
    const student = getStudentById(reg?.student_id);
    const exam = getExamById(reg?.exam_id);
    toast.success(`Result for ${student?.first_name} ${student?.last_name} (${exam?.exam_code}) added!`);
    setForm({
      registration_id: "", marks_obtained: "", grade: "A", percentile: "",
      rank_position: "", result_status: "Pass",
      published_date: new Date().toISOString().slice(0, 10), remarks: "",
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
          <div className="page-title">Add Result</div>
          <div className="page-subtitle">Record examination result for a student</div>
        </div>
      </div>
      <div className="page-body">
        <div className="form-section">
          <div className="card card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">Result Entry</div>
              <div className="form-grid mb-4">
                <div className="form-group form-grid-full">
                  <label className="form-label">Registration <span className="required">*</span></label>
                  <select className="form-select" {...field("registration_id")}>
                    <option value="">Select confirmed registration...</option>
                    {confirmedRegs.map((r) => {
                      const student = getStudentById(r.student_id);
                      const exam = getExamById(r.exam_id);
                      const hasResult = existingResultRegIds.includes(r.registration_id);
                      return (
                        <option key={r.registration_id} value={r.registration_id} disabled={hasResult}>
                          #{r.registration_id} — {student?.first_name} {student?.last_name} / {exam?.exam_code}
                          {hasResult ? " (result exists)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {errors.registration_id && <span className="form-error">{errors.registration_id}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Marks Obtained <span className="required">*</span></label>
                  <input type="number" step="0.5" className="form-input" placeholder="e.g. 245.5" {...field("marks_obtained")} />
                  {errors.marks_obtained && <span className="form-error">{errors.marks_obtained}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-select" {...field("grade")}>
                    {["A", "B", "C", "D", "F"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Percentile <span className="required">*</span></label>
                  <input type="number" step="0.01" min="0" max="100" className="form-input" placeholder="e.g. 98.5" {...field("percentile")} />
                  {errors.percentile && <span className="form-error">{errors.percentile}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Rank Position <span className="required">*</span></label>
                  <input type="number" className="form-input" placeholder="e.g. 1520" {...field("rank_position")} />
                  {errors.rank_position && <span className="form-error">{errors.rank_position}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Result Status</label>
                  <select className="form-select" {...field("result_status")}>
                    {["Pass", "Fail", "Absent", "Withheld"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Published Date <span className="required">*</span></label>
                  <input type="date" className="form-input" {...field("published_date")} />
                  {errors.published_date && <span className="form-error">{errors.published_date}</span>}
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-textarea" placeholder="Optional remarks..." {...field("remarks")} />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? "Saving..." : "Add Result"}
                </button>
              </div>
            </form>
          </div>

          {/* Existing results preview */}
          <div className="card mt-6">
            <div className="card-header">
              <span className="card-title">Published Results</span>
              <span className="badge badge-primary">{results.length} records</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Exam</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Percentile</th>
                      <th>Rank</th>
                      <th>Status</th>
                      <th>Published</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res) => {
                      const reg = getRegistrationById(res.registration_id);
                      const student = reg ? getStudentById(reg.student_id) : null;
                      const exam = reg ? getExamById(reg.exam_id) : null;
                      return (
                        <tr key={res.result_id}>
                          <td style={{ fontWeight: 500 }}>{student?.first_name} {student?.last_name}</td>
                          <td><span className="badge badge-primary">{exam?.exam_code}</span></td>
                          <td style={{ fontWeight: 600 }}>{res.marks_obtained}</td>
                          <td><span className={`badge ${gradeColor(res.grade)}`}>{res.grade}</span></td>
                          <td>{res.percentile}%</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px" }}>
                            #{res.rank_position.toLocaleString()}
                          </td>
                          <td><span className={`badge ${statusColor(res.result_status)}`}>{res.result_status}</span></td>
                          <td className="text-sm text-muted">{res.published_date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RankList() {
  const [examId, setExamId] = useState("1");

  // Build rank list for selected exam
  const rankData = results
    .filter((res) => {
      const reg = getRegistrationById(res.registration_id);
      return reg && reg.exam_id === parseInt(examId);
    })
    .sort((a, b) => a.rank_position - b.rank_position)
    .map((res) => {
      const reg = getRegistrationById(res.registration_id);
      const student = reg ? getStudentById(reg.student_id) : null;
      return { res, student, reg };
    });

  const exam = getExamById(parseInt(examId));
  const passCount = rankData.filter((d) => d.res.result_status === "Pass").length;
  const passPercent = rankData.length > 0 ? Math.round((passCount / rankData.length) * 100) : 0;
  const topScore = rankData.length > 0 ? rankData[0].res.marks_obtained : 0;
  const avgScore = rankData.length > 0
    ? (rankData.reduce((sum, d) => sum + d.res.marks_obtained, 0) / rankData.length).toFixed(1)
    : 0;

  function rankMedal(rank) {
    if (rank === 1) return <Trophy size={16} color="#d97706" />;
    if (rank === 2) return <Medal size={16} color="#9ca3af" />;
    if (rank === 3) return <Medal size={16} color="#b45309" />;
    return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "var(--text-secondary)" }}>#{rank.toLocaleString()}</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Rank List</div>
          <div className="page-subtitle">Examination rank list with DENSE_RANK ordering</div>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "180px" }}
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          >
            {exams.map((e) => <option key={e.exam_id} value={e.exam_id}>{e.exam_code}</option>)}
          </select>
        </div>
      </div>

      <div className="page-body">
        {/* Summary */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card">
            <div className="stat-icon indigo"><BarChart2 size={20} /></div>
            <div>
              <div className="stat-value">{rankData.length}</div>
              <div className="stat-label">Total Appeared</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><TrendingUp size={20} /></div>
            <div>
              <div className="stat-value">{passPercent}%</div>
              <div className="stat-label">Pass Rate</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><Trophy size={20} /></div>
            <div>
              <div className="stat-value">{topScore}</div>
              <div className="stat-label">Top Score</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rose"><BarChart2 size={20} /></div>
            <div>
              <div className="stat-value">{avgScore}</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
        </div>

        {/* Exam info banner */}
        {exam && (
          <div style={{
            background: "linear-gradient(135deg, var(--primary-700), var(--primary-500))",
            borderRadius: "var(--radius-lg)",
            padding: "20px 28px",
            color: "#fff",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: "13px", opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Rank List
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px" }}>{exam.exam_name}</div>
              <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
                {exam.exam_code} · {exam.conducting_body} · Total Marks: {exam.total_marks} · Pass: {exam.passing_marks}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "36px", fontWeight: 800 }}>{passCount}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>students passed</div>
            </div>
          </div>
        )}

        {rankData.length === 0 ? (
          <div className="card card-body">
            <div className="empty-state">
              <BarChart2 size={36} className="empty-state-icon" />
              <div className="empty-state-title">No results available</div>
              <div className="empty-state-desc">No results have been published for this exam yet</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Marks Obtained</th>
                  <th>Out of</th>
                  <th>Grade</th>
                  <th>Percentile</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rankData.map(({ res, student }, idx) => (
                  <tr key={res.result_id} style={{
                    background: res.rank_position === 1
                      ? "linear-gradient(90deg, #fffbeb 0%, transparent 100%)"
                      : undefined,
                  }}>
                    <td>
                      <div className="flex items-center gap-2">
                        {rankMedal(res.rank_position)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--primary-400), var(--primary-300))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                          {student?.first_name?.[0]}{student?.last_name?.[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{student?.first_name} {student?.last_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{student?.category}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--primary-700)" }}>
                        {res.marks_obtained}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{exam?.total_marks}</td>
                    <td>
                      <span className={`badge ${gradeColor(res.grade)}`}>{res.grade}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "60px", height: "5px", background: "#e5e7eb",
                          borderRadius: "3px", overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${res.percentile}%`, height: "100%",
                            background: res.percentile >= 90 ? "var(--success-500)" : res.percentile >= 70 ? "var(--warning-500)" : "var(--danger-500)",
                            borderRadius: "3px",
                          }} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "13px" }}>{res.percentile}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusColor(res.result_status)}`}>{res.result_status}</span>
                    </td>
                    <td className="text-sm text-muted">{res.remarks || "—"}</td>
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

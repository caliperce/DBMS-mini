import { useState, useEffect } from "react";
import { BarChart2, Trophy, Medal, TrendingUp } from "lucide-react";
import { api } from "../api";
import toast from "react-hot-toast";

function gradeColor(g) { return g === "A" ? "badge-success" : g === "B" ? "badge-primary" : g === "C" ? "badge-warning" : "badge-danger"; }
function statusColor(s) { return s === "Pass" ? "badge-success" : s === "Fail" ? "badge-danger" : s === "Absent" ? "badge-warning" : "badge-gray"; }

export function AddResult() {
  const [regs, setRegs] = useState([]);
  const [form, setForm] = useState({ registration_id: "", marks_obtained: "", grade: "A", percentile: "", rank_position: "", result_status: "Pass", remarks: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([api.getRegistrations(), api.getResults()]).then(([r, res]) => {
      setRegs(r.filter((rr) => rr.status === "Confirmed"));
      setResults(res);
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.registration_id) e.registration_id = "Required";
    if (!form.marks_obtained || isNaN(form.marks_obtained)) e.marks_obtained = "Required";
    if (!form.percentile || isNaN(form.percentile)) e.percentile = "Required";
    if (!form.rank_position || isNaN(form.rank_position)) e.rank_position = "Required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      await api.addResult({ ...form, registration_id: +form.registration_id, marks_obtained: +form.marks_obtained, percentile: +form.percentile, rank_position: +form.rank_position });
      toast.success("Result added!");
      setForm({ registration_id: "", marks_obtained: "", grade: "A", percentile: "", rank_position: "", result_status: "Pass", remarks: "" }); setErrors({});
      api.getResults().then(setResults);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Add Result</div><div className="page-subtitle">Record examination result</div></div></div>
      <div className="page-body"><div className="form-section"><div className="card card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Result Entry</div>
          <div className="form-grid mb-4">
            <div className="form-group form-grid-full"><label className="form-label">Registration <span className="required">*</span></label>
              <select className="form-select" {...field("registration_id")}><option value="">Select...</option>
                {regs.map((r) => <option key={r.registration_id} value={r.registration_id}>#{r.registration_id} — {r.student_name} / {r.exam_code}</option>)}
              </select>{errors.registration_id && <span className="form-error">{errors.registration_id}</span>}
            </div>
            <div className="form-group"><label className="form-label">Marks <span className="required">*</span></label><input type="number" step="0.5" className="form-input" {...field("marks_obtained")} />{errors.marks_obtained && <span className="form-error">{errors.marks_obtained}</span>}</div>
            <div className="form-group"><label className="form-label">Grade</label><select className="form-select" {...field("grade")}>{["A","B","C","D","F"].map((g) => <option key={g}>{g}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Percentile <span className="required">*</span></label><input type="number" step="0.01" className="form-input" {...field("percentile")} />{errors.percentile && <span className="form-error">{errors.percentile}</span>}</div>
            <div className="form-group"><label className="form-label">Rank <span className="required">*</span></label><input type="number" className="form-input" {...field("rank_position")} />{errors.rank_position && <span className="form-error">{errors.rank_position}</span>}</div>
            <div className="form-group"><label className="form-label">Status</label><select className="form-select" {...field("result_status")}>{["Pass","Fail","Absent","Withheld"].map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group form-grid-full"><label className="form-label">Remarks</label><textarea className="form-textarea" {...field("remarks")} /></div>
          </div>
          <div className="flex gap-3 justify-end"><button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? "Saving..." : "Add Result"}</button></div>
        </form>
      </div>

      {results.length > 0 && (
        <div className="card mt-6">
          <div className="card-header"><span className="card-title">Published Results</span><span className="badge badge-primary">{results.length}</span></div>
          <div className="card-body" style={{ padding: 0 }}><div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="data-table">
              <thead><tr><th>Student</th><th>Exam</th><th>Marks</th><th>Grade</th><th>Percentile</th><th>Rank</th><th>Status</th></tr></thead>
              <tbody>{results.map((r) => (
                <tr key={r.result_id}>
                  <td style={{ fontWeight: 500 }}>{r.student_name}</td>
                  <td><span className="badge badge-primary">{r.exam_code}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.marks_obtained}</td>
                  <td><span className={`badge ${gradeColor(r.grade)}`}>{r.grade}</span></td>
                  <td>{r.percentile}%</td>
                  <td className="font-mono text-xs">#{r.rank_position?.toLocaleString()}</td>
                  <td><span className={`badge ${statusColor(r.result_status)}`}>{r.result_status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div></div>
        </div>
      )}
      </div></div>
    </div>
  );
}

export function RankList() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [rankData, setRankData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getExams().then((e) => { setExams(e); if (e.length > 0) setExamId(String(e[0].exam_id)); }); }, []);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    api.getRankList(examId).then(setRankData).catch(() => setRankData([])).finally(() => setLoading(false));
  }, [examId]);

  const exam = exams.find((e) => e.exam_id === parseInt(examId));
  const passCount = rankData.filter((d) => d.result_status === "Pass").length;
  const topScore = rankData.length > 0 ? rankData[0]?.marks_obtained : 0;
  const avgScore = rankData.length > 0 ? (rankData.reduce((s, d) => s + d.marks_obtained, 0) / rankData.length).toFixed(1) : 0;
  const passPercent = rankData.length > 0 ? Math.round((passCount / rankData.length) * 100) : 0;

  function rankMedal(rank) {
    if (rank === 1) return <Trophy size={16} color="#d97706" />;
    if (rank === 2) return <Medal size={16} color="#9ca3af" />;
    if (rank === 3) return <Medal size={16} color="#b45309" />;
    return <span className="font-mono text-xs text-muted">#{rank}</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Rank List</div><div className="page-subtitle">Examination rank list with RANK() ordering</div></div>
        <select className="form-select" style={{ width: "auto", minWidth: "180px" }} value={examId} onChange={(e) => setExamId(e.target.value)}>
          {exams.map((e) => <option key={e.exam_id} value={e.exam_id}>{e.exam_code}</option>)}
        </select>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card"><div className="stat-icon indigo"><BarChart2 size={20} /></div><div><div className="stat-value">{rankData.length}</div><div className="stat-label">Total Appeared</div></div></div>
          <div className="stat-card"><div className="stat-icon green"><TrendingUp size={20} /></div><div><div className="stat-value">{passPercent}%</div><div className="stat-label">Pass Rate</div></div></div>
          <div className="stat-card"><div className="stat-icon amber"><Trophy size={20} /></div><div><div className="stat-value">{topScore}</div><div className="stat-label">Top Score</div></div></div>
          <div className="stat-card"><div className="stat-icon rose"><BarChart2 size={20} /></div><div><div className="stat-value">{avgScore}</div><div className="stat-label">Average</div></div></div>
        </div>
        {exam && (
          <div style={{ background: "linear-gradient(135deg, var(--primary-700), var(--primary-500))", borderRadius: "var(--radius-lg)", padding: "20px 28px", color: "#fff", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", opacity: 0.8, fontWeight: 600, textTransform: "uppercase" }}>Rank List</div>
              <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px" }}>{exam.exam_name}</div>
              <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>{exam.exam_code} | Total: {exam.total_marks} | Pass: {exam.passing_marks}</div>
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: "36px", fontWeight: 800 }}>{passCount}</div><div style={{ fontSize: "12px", opacity: 0.8 }}>passed</div></div>
          </div>
        )}
        {loading ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div> : rankData.length === 0 ? (
          <div className="card card-body"><div className="empty-state"><div className="empty-state-title">No results</div></div></div>
        ) : (
          <div className="table-wrapper"><table className="data-table">
            <thead><tr><th>Rank</th><th>Student</th><th>Marks</th><th>Grade</th><th>Percentile</th><th>Status</th><th>Remarks</th></tr></thead>
            <tbody>{rankData.map((r, i) => (
              <tr key={r.result_id || i}>
                <td>{rankMedal(r.computed_rank)}</td>
                <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                <td style={{ fontWeight: 700, fontSize: "15px", color: "var(--primary-700)" }}>{r.marks_obtained}</td>
                <td><span className={`badge ${gradeColor(r.grade)}`}>{r.grade}</span></td>
                <td><div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "60px", height: "5px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${r.percentile}%`, height: "100%", background: r.percentile >= 90 ? "var(--success-500)" : "var(--warning-500)", borderRadius: "3px" }} />
                  </div><span style={{ fontWeight: 600, fontSize: "13px" }}>{r.percentile}%</span>
                </div></td>
                <td><span className={`badge ${statusColor(r.result_status)}`}>{r.result_status}</span></td>
                <td className="text-sm text-muted">{r.remarks || "—"}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}

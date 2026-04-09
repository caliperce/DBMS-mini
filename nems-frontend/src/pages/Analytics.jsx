import { useState, useEffect } from "react";
import { Database, PieChart as PieIcon, BarChart2, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "../api";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [tableCounts, setTableCounts] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [centrePassData, setCentrePassData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getExams(), api.getTableCounts()]).then(([e, tc]) => {
      setExams(e);
      setTableCounts(tc);
      if (e.length > 0) setExamId(String(e[0].exam_id));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!examId) return;
    Promise.all([
      api.getCategoryCount(examId),
      api.getPassPercentage(examId),
      api.getSubjectMarks(examId),
    ]).then(([cat, pass, subj]) => {
      setCategoryData(cat);
      setCentrePassData(pass);
      setSubjectData(subj);
    }).catch(() => {});
  }, [examId]);

  const selectedExam = exams.find((e) => e.exam_id === parseInt(examId));

  if (loading) return <div className="page-body" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Analytics & Reports</div><div className="page-subtitle">Comprehensive data visualizations</div></div>
        <div className="flex gap-2 items-center">
          <label className="form-label" style={{ margin: 0, whiteSpace: "nowrap" }}>Exam:</label>
          <select className="form-select" style={{ width: "auto", minWidth: "180px" }} value={examId} onChange={(e) => setExamId(e.target.value)}>
            {exams.map((e) => <option key={e.exam_id} value={e.exam_id}>{e.exam_code} - {e.exam_name}</option>)}
          </select>
        </div>
      </div>
      <div className="page-body">
        {/* Table Row Counts */}
        <div className="card mb-6">
          <div className="card-header"><span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><Database size={16} /> Table Row Counts</span></div>
          <div className="card-body" style={{ padding: 0 }}><div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="data-table">
              <thead><tr><th>Table</th><th>Rows</th><th>Visual</th></tr></thead>
              <tbody>{Object.entries(tableCounts).map(([table, count]) => {
                const maxCount = Math.max(...Object.values(tableCounts), 1);
                return (
                  <tr key={table}>
                    <td style={{ fontWeight: 600 }}>{table}</td>
                    <td><span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "14px", color: "var(--primary-600)" }}>{count}</span></td>
                    <td style={{ width: "40%" }}><div style={{ height: "8px", background: "var(--gray-100)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: "linear-gradient(90deg, var(--primary-400), var(--primary-600))", borderRadius: "4px" }} />
                    </div></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div></div>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div className="card">
            <div className="card-header"><span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><PieIcon size={16} /> Students by Category</span><span className="badge badge-primary">{selectedExam?.exam_code}</span></div>
            <div className="card-body">
              {categoryData.length === 0 ? <div className="empty-state" style={{ padding: "32px 0" }}><div className="empty-state-title">No data</div></div> : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie><Tooltip /><Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "12px" }} /></PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><BarChart2 size={16} /> Pass % by Centre</span><span className="badge badge-primary">{selectedExam?.exam_code}</span></div>
            <div className="card-body">
              {centrePassData.length === 0 ? <div className="empty-state" style={{ padding: "32px 0" }}><div className="empty-state-title">No data</div></div> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={centrePassData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={130} style={{ fontSize: "11px" }} tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "..." : v} />
                    <Tooltip formatter={(v, n) => [`${v}%`, n === "pass_pct" ? "Pass %" : "Fail %"]} />
                    <Bar dataKey="pass_pct" name="Pass %" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="fail_pct" name="Fail %" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Subject marks */}
        <div className="card mb-6">
          <div className="card-header"><span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><TrendingUp size={16} /> Avg Marks by Subject</span><span className="badge badge-primary">{selectedExam?.exam_code}</span></div>
          <div className="card-body">
            {subjectData.length === 0 ? <div className="empty-state" style={{ padding: "32px 0" }}><div className="empty-state-title">No data</div></div> : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "11px" }} />
                    <Tooltip /><Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="avg_marks" name="Avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max_marks" name="Max" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min_marks" name="Min" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="table-wrapper mt-4"><table className="data-table">
                  <thead><tr><th>Subject</th><th>Responses</th><th>Avg</th><th>Max</th><th>Min</th></tr></thead>
                  <tbody>{subjectData.map((s) => (
                    <tr key={s.name}><td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.responses}</td>
                      <td style={{ fontWeight: 700, color: "var(--primary-600)" }}>{s.avg_marks}</td>
                      <td style={{ color: "var(--success-600)" }}>{s.max_marks}</td>
                      <td style={{ color: "var(--warning-600)" }}>{s.min_marks}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

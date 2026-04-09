import { useState } from "react";
import { Database, PieChart as PieIcon, BarChart2, TrendingUp } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  students, exams, registrations, results, responses, questions,
  hallTickets, grievances, examCentres, schedules, tableCounts,
  getStudentById, getExamById, getRegistrationById, getCentreById, getScheduleById,
} from "../data/mockData";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];
const BAR_COLORS = { pass: "#10b981", fail: "#ef4444" };

export default function Analytics() {
  const [examId, setExamId] = useState("1");
  const selectedExam = getExamById(parseInt(examId));

  // ========== Students by Category (Pie) ==========
  const categoryData = (() => {
    const examRegs = registrations.filter((r) => r.exam_id === parseInt(examId));
    const counts = {};
    examRegs.forEach((r) => {
      const s = getStudentById(r.student_id);
      if (s) counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // ========== Pass Percentage by Centre (Bar) ==========
  const centrePassData = (() => {
    const examResults = results.filter((res) => {
      const reg = getRegistrationById(res.registration_id);
      return reg && reg.exam_id === parseInt(examId);
    });
    const centreStats = {};
    examResults.forEach((res) => {
      const reg = getRegistrationById(res.registration_id);
      const ht = hallTickets.find((t) => t.registration_id === res.registration_id);
      if (!ht) return;
      const sched = getScheduleById(ht.schedule_id);
      if (!sched) return;
      const centre = getCentreById(sched.centre_id);
      if (!centre) return;
      const key = centre.centre_name;
      if (!centreStats[key]) centreStats[key] = { name: key, city: centre.city, total: 0, passed: 0 };
      centreStats[key].total++;
      if (res.result_status === "Pass") centreStats[key].passed++;
    });
    return Object.values(centreStats).map((c) => ({
      ...c,
      pass_pct: c.total > 0 ? Math.round((c.passed / c.total) * 100) : 0,
      fail_pct: c.total > 0 ? Math.round(((c.total - c.passed) / c.total) * 100) : 0,
    }));
  })();

  // ========== Avg Marks by Subject Area (Bar) ==========
  const subjectData = (() => {
    const examQuestions = questions.filter((q) => q.exam_id === parseInt(examId));
    const qIds = examQuestions.map((q) => q.question_id);
    const examResponses = responses.filter((r) => qIds.includes(r.question_id));
    const subjectStats = {};
    examResponses.forEach((r) => {
      const q = examQuestions.find((qq) => qq.question_id === r.question_id);
      if (!q) return;
      const key = q.subject_area;
      if (!subjectStats[key]) subjectStats[key] = { name: key, total: 0, count: 0, max: -Infinity, min: Infinity };
      subjectStats[key].total += r.marks_awarded;
      subjectStats[key].count++;
      subjectStats[key].max = Math.max(subjectStats[key].max, r.marks_awarded);
      subjectStats[key].min = Math.min(subjectStats[key].min, r.marks_awarded);
    });
    return Object.values(subjectStats).map((s) => ({
      name: s.name,
      avg_marks: s.count > 0 ? parseFloat((s.total / s.count).toFixed(2)) : 0,
      max_marks: s.max === -Infinity ? 0 : s.max,
      min_marks: s.min === Infinity ? 0 : s.min,
      responses: s.count,
    }));
  })();

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics & Reports</div>
          <div className="page-subtitle">Comprehensive reports and data visualizations</div>
        </div>
        <div className="flex gap-2 items-center">
          <label className="form-label" style={{ margin: 0, whiteSpace: "nowrap" }}>Exam:</label>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "180px" }}
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          >
            {exams.map((e) => (
              <option key={e.exam_id} value={e.exam_id}>{e.exam_code} - {e.exam_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="page-body">
        {/* Table Row Counts */}
        <div className="card mb-6">
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Database size={16} /> Table Row Counts
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Table Name</th>
                    <th>Row Count</th>
                    <th>Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tableCounts).map(([table, count]) => {
                    const maxCount = Math.max(...Object.values(tableCounts));
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <tr key={table}>
                        <td style={{ fontWeight: 600 }}>{table}</td>
                        <td>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "var(--primary-600)",
                          }}>
                            {count}
                          </span>
                        </td>
                        <td style={{ width: "40%" }}>
                          <div style={{
                            height: "8px", background: "var(--gray-100)",
                            borderRadius: "4px", overflow: "hidden", width: "100%",
                          }}>
                            <div style={{
                              height: "100%", width: `${pct}%`,
                              background: "linear-gradient(90deg, var(--primary-400), var(--primary-600))",
                              borderRadius: "4px", transition: "width 0.6s ease",
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* Students by Category */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <PieIcon size={16} /> Students by Category
              </span>
              <span className="badge badge-primary">{selectedExam?.exam_code}</span>
            </div>
            <div className="card-body">
              {categoryData.length === 0 ? (
                <div className="empty-state" style={{ padding: "32px 0" }}>
                  <div className="empty-state-title">No data</div>
                  <div className="empty-state-desc">No registrations for this exam</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px", border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "13px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pass Percentage by Centre */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart2 size={16} /> Pass % by Centre
              </span>
              <span className="badge badge-primary">{selectedExam?.exam_code}</span>
            </div>
            <div className="card-body">
              {centrePassData.length === 0 ? (
                <div className="empty-state" style={{ padding: "32px 0" }}>
                  <div className="empty-state-title">No data</div>
                  <div className="empty-state-desc">No results available for centres</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={centrePassData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}
                      style={{ fontSize: "11px" }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      style={{ fontSize: "11px" }}
                      tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "..." : v}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px", border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "13px",
                      }}
                      formatter={(value, name) => [`${value}%`, name === "pass_pct" ? "Pass %" : "Fail %"]}
                    />
                    <Bar dataKey="pass_pct" name="Pass %" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="fail_pct" name="Fail %" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Avg Marks by Subject */}
        <div className="card mb-6">
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} /> Average Marks by Subject Area
            </span>
            <span className="badge badge-primary">{selectedExam?.exam_code}</span>
          </div>
          <div className="card-body">
            {subjectData.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 0" }}>
                <div className="empty-state-title">No data</div>
                <div className="empty-state-desc">No responses recorded for this exam</div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px", border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "13px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="avg_marks" name="Avg Marks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max_marks" name="Max Marks" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min_marks" name="Min Marks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Subject detail table */}
                <div className="table-wrapper mt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject Area</th>
                        <th>Responses</th>
                        <th>Avg Marks</th>
                        <th>Max Marks</th>
                        <th>Min Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectData.map((s) => (
                        <tr key={s.name}>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>{s.responses}</td>
                          <td style={{ fontWeight: 700, color: "var(--primary-600)" }}>{s.avg_marks}</td>
                          <td style={{ color: "var(--success-600)" }}>{s.max_marks}</td>
                          <td style={{ color: "var(--warning-600)" }}>{s.min_marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

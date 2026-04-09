import { Users, BookOpen, ClipboardList, BarChart2, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { students, exams, registrations, results, grievances, tableCounts } from "../data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const CATEGORY_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#f43f5e", "#8b5cf6"];

export default function Dashboard() {
  const categoryData = [
    { name: "General", value: students.filter((s) => s.category === "General").length },
    { name: "OBC", value: students.filter((s) => s.category === "OBC").length },
    { name: "SC", value: students.filter((s) => s.category === "SC").length },
    { name: "ST", value: students.filter((s) => s.category === "ST").length },
    { name: "EWS", value: students.filter((s) => s.category === "EWS").length },
  ].filter((d) => d.value > 0);

  const examRegData = exams.map((e) => ({
    name: e.exam_code,
    registrations: registrations.filter((r) => r.exam_id === e.exam_id).length,
    confirmed: registrations.filter((r) => r.exam_id === e.exam_id && r.status === "Confirmed").length,
  }));

  const confirmedCount = registrations.filter((r) => r.status === "Confirmed").length;
  const pendingCount = registrations.filter((r) => r.status === "Pending").length;
  const passCount = results.filter((r) => r.result_status === "Pass").length;
  const openGrievances = grievances.filter((g) => g.status === "Open" || g.status === "Under Review").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Welcome to the National Examination Management System</div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="badge badge-success">System Active</span>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon indigo"><Users size={22} /></div>
            <div>
              <div className="stat-value">{students.length}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><BookOpen size={22} /></div>
            <div>
              <div className="stat-value">{exams.length}</div>
              <div className="stat-label">Active Exams</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><ClipboardList size={22} /></div>
            <div>
              <div className="stat-value">{registrations.length}</div>
              <div className="stat-label">Total Registrations</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rose"><BarChart2 size={22} /></div>
            <div>
              <div className="stat-value">{results.length}</div>
              <div className="stat-label">Results Published</div>
            </div>
          </div>
        </div>

        {/* Sub-stats */}
        <div className="flex gap-3 mb-6" style={{ flexWrap: "wrap" }}>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", flex: "1", minWidth: "160px" }}>
            <CheckCircle size={18} color="var(--success-600)" />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{confirmedCount}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Confirmed Registrations</div>
            </div>
          </div>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", flex: "1", minWidth: "160px" }}>
            <Clock size={18} color="var(--warning-600)" />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{pendingCount}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Pending Payments</div>
            </div>
          </div>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", flex: "1", minWidth: "160px" }}>
            <TrendingUp size={18} color="var(--success-600)" />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{passCount}/{results.length}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Pass Rate</div>
            </div>
          </div>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", flex: "1", minWidth: "160px" }}>
            <AlertCircle size={18} color="var(--danger-500)" />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{openGrievances}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Open Grievances</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Registrations by Exam</span>
            </div>
            <div className="card-body">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examRegData} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="registrations" fill="#6366f1" name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="confirmed" fill="#22c55e" name="Confirmed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Students by Category</span>
            </div>
            <div className="card-body">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Table counts */}
        <div className="card mt-6">
          <div className="card-header">
            <span className="card-title">Database Table Overview</span>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {Object.entries(tableCounts).map(([table, count]) => (
                <div
                  key={table}
                  style={{
                    background: "var(--bg-base)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    borderLeft: "3px solid var(--primary-400)",
                  }}
                >
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{count}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", marginTop: "3px" }}>{table}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent registrations */}
        <div className="card mt-6">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
          </div>
          <div className="card-body" style={{ padding: "0 0 8px 0" }}>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reg ID</th>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {[...registrations].sort((a, b) => b.registration_id - a.registration_id).slice(0, 6).map((reg) => {
                    const student = students.find((s) => s.student_id === reg.student_id);
                    const exam = exams.find((e) => e.exam_id === reg.exam_id);
                    return (
                      <tr key={reg.registration_id}>
                        <td className="font-mono text-xs">#{reg.registration_id.toString().padStart(4, "0")}</td>
                        <td style={{ fontWeight: 500 }}>{student?.first_name} {student?.last_name}</td>
                        <td><span className="badge badge-primary">{exam?.exam_code}</span></td>
                        <td className="text-muted text-sm">{reg.registration_date}</td>
                        <td>
                          <span className={`badge ${reg.status === "Confirmed" ? "badge-success" : reg.status === "Pending" ? "badge-warning" : "badge-danger"}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${reg.fee_paid ? "badge-success" : "badge-warning"}`}>
                            {reg.fee_paid ? "Paid" : "Unpaid"}
                          </span>
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
    </div>
  );
}

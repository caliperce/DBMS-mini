// API service layer — connects React frontend to Express backend

const BASE = "http://localhost:3001/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ======================== Students ========================
export const api = {
  // Students
  getStudents: () => request("/students"),
  getStudent: (id) => request(`/students/${id}`),
  addStudent: (data) => request("/students", { method: "POST", body: JSON.stringify(data) }),

  // Exams
  getExams: () => request("/exams"),
  addExam: (data) => request("/exams", { method: "POST", body: JSON.stringify(data) }),

  // Registrations
  getRegistrations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/registrations${qs ? `?${qs}` : ""}`);
  },
  addRegistration: (data) => request("/registrations", { method: "POST", body: JSON.stringify(data) }),
  confirmPayment: (id, data) => request(`/registrations/${id}/payment`, { method: "PUT", body: JSON.stringify(data) }),

  // Centres
  getCentres: () => request("/centres"),
  addCentre: (data) => request("/centres", { method: "POST", body: JSON.stringify(data) }),

  // Schedules
  getSchedules: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/schedules${qs ? `?${qs}` : ""}`);
  },
  addSchedule: (data) => request("/schedules", { method: "POST", body: JSON.stringify(data) }),

  // Hall Tickets
  getHallTickets: (studentId) => request(`/hall-tickets?student_id=${studentId}`),
  generateHallTicket: (data) => request("/hall-tickets", { method: "POST", body: JSON.stringify(data) }),

  // Results
  getResults: () => request("/results"),
  getRankList: (examId) => request(`/results/rank-list?exam_id=${examId}`),
  addResult: (data) => request("/results", { method: "POST", body: JSON.stringify(data) }),

  // Grievances
  getGrievances: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/grievances${qs ? `?${qs}` : ""}`);
  },
  addGrievance: (data) => request("/grievances", { method: "POST", body: JSON.stringify(data) }),
  resolveGrievance: (id, notes) => request(`/grievances/${id}/resolve`, { method: "PUT", body: JSON.stringify({ resolution_notes: notes }) }),

  // Analytics
  getTableCounts: () => request("/analytics/table-counts"),
  getDashboard: () => request("/analytics/dashboard"),
  getCategoryCount: (examId) => request(`/analytics/category-count?exam_id=${examId}`),
  getPassPercentage: (examId) => request(`/analytics/pass-percentage?exam_id=${examId}`),
  getSubjectMarks: (examId) => request(`/analytics/subject-marks?exam_id=${examId}`),
};

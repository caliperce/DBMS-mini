import { useState } from "react";
import { Search, UserPlus, Eye, User } from "lucide-react";
import { students } from "../data/mockData";
import toast from "react-hot-toast";

function categoryBadge(cat) {
  const map = { General: "badge-primary", OBC: "badge-warning", SC: "badge-success", ST: "badge-success", EWS: "badge-gray" };
  return map[cat] || "badge-gray";
}

function genderLabel(g) {
  return g === "M" ? "Male" : g === "F" ? "Female" : g;
}

function calcAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

function StudentDetail({ student, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
    }} onClick={onClose}>
      <div
        className="card"
        style={{ maxWidth: "560px", width: "100%", padding: "32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-6">
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary-500), var(--primary-400))",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <User size={28} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
              {student.first_name} {student.last_name}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Student ID: {student.student_id}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className={`badge ${categoryBadge(student.category)}`}>{student.category}</span>
          </div>
        </div>

        <div className="form-grid">
          {[
            ["Date of Birth", student.date_of_birth],
            ["Age", `${calcAge(student.date_of_birth)} years`],
            ["Gender", genderLabel(student.gender)],
            ["Nationality", student.nationality],
            ["Email", student.email],
            ["Phone", student.phone],
            ["Created At", student.created_at],
            ["Category", student.category],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="form-label" style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>{label}</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{value}</div>
            </div>
          ))}
          <div className="form-grid-full">
            <div className="form-label" style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>Address</div>
            <div style={{ fontSize: "14px", fontWeight: 500 }}>{student.address}</div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export function StudentList() {
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [localStudents, setLocalStudents] = useState(students);

  const filtered = localStudents.filter((s) => {
    const q = query.toLowerCase();
    const matchQ = `${s.first_name} ${s.last_name} ${s.email} ${s.student_id}`.toLowerCase().includes(q);
    const matchCat = catFilter === "All" || s.category === catFilter;
    return matchQ && matchCat;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Students</div>
          <div className="page-subtitle">Manage all registered students</div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="badge badge-primary">{localStudents.length} total</span>
          <a href="/students/add" className="btn btn-primary">
            <UserPlus size={15} /> Add Student
          </a>
        </div>
      </div>

      <div className="page-body">
        <div className="flex gap-3 items-center mb-4">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name, email, ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "140px" }}
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            {["All", "General", "OBC", "SC", "ST", "EWS"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Nationality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-title">No students found</div>
                      <div className="empty-state-desc">Try adjusting your search filters</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((s) => (
                <tr key={s.student_id}>
                  <td className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>#{s.student_id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--primary-400), var(--primary-300))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0
                      }}>
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <span style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td>{genderLabel(s.gender)}</td>
                  <td className="text-sm text-muted">{s.date_of_birth}</td>
                  <td className="text-sm">{s.email}</td>
                  <td className="text-sm text-muted">{s.phone}</td>
                  <td><span className={`badge ${categoryBadge(s.category)}`}>{s.category}</span></td>
                  <td className="text-sm text-muted">{s.nationality}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelected(s)}
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export function AddStudent() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", date_of_birth: "", gender: "M",
    email: "", phone: "", address: "", nationality: "Indian",
    category: "General",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.date_of_birth) e.date_of_birth = "Date of birth is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone)) e.phone = "Phone must be 10 digits";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success(`Student ${form.first_name} ${form.last_name} added successfully!`);
    setForm({ first_name: "", last_name: "", date_of_birth: "", gender: "M", email: "", phone: "", address: "", nationality: "Indian", category: "General" });
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
          <div className="page-title">Add Student</div>
          <div className="page-subtitle">Register a new student in the system</div>
        </div>
      </div>

      <div className="page-body">
        <div className="form-section">
          <div className="card card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">Personal Information</div>
              <div className="form-grid mb-4">
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. Arjun" {...field("first_name")} />
                  {errors.first_name && <span className="form-error">{errors.first_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. Sharma" {...field("last_name")} />
                  {errors.last_name && <span className="form-error">{errors.last_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth <span className="required">*</span></label>
                  <input type="date" className="form-input" {...field("date_of_birth")} />
                  {errors.date_of_birth && <span className="form-error">{errors.date_of_birth}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" {...field("gender")}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input className="form-input" placeholder="e.g. Indian" {...field("nationality")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" {...field("category")}>
                    {["General", "OBC", "SC", "ST", "EWS"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-section-title">Contact Information</div>
              <div className="form-grid mb-4">
                <div className="form-group">
                  <label className="form-label">Email <span className="required">*</span></label>
                  <input type="email" className="form-input" placeholder="email@example.com" {...field("email")} />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone <span className="required">*</span></label>
                  <input className="form-input" placeholder="10-digit number" maxLength={10} {...field("phone")} />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" placeholder="Full address" {...field("address")} />
                </div>
              </div>

              <div className="flex gap-3 justify-between items-center">
                <span className="text-sm text-muted">Fields marked <span style={{ color: "var(--danger-500)" }}>*</span> are required</span>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setForm({ first_name: "", last_name: "", date_of_birth: "", gender: "M", email: "", phone: "", address: "", nationality: "Indian", category: "General" })}>
                    Reset
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? "Saving..." : "Add Student"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

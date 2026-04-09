import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { examCentres } from "../data/mockData";
import toast from "react-hot-toast";

export function CentreList() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Exam Centres</div>
          <div className="page-subtitle">Registered examination venues</div>
        </div>
        <div className="flex gap-2">
          <a href="/centres/add" className="btn btn-primary"><Plus size={15} /> Add Centre</a>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
          {examCentres.map((c) => (
            <div key={c.centre_id} className="card" style={{ padding: "20px" }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "var(--primary-100)", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <MapPin size={20} color="var(--primary-600)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>{c.centre_name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.city}, {c.state}</div>
                </div>
                <span className={`badge ${c.is_active ? "badge-success" : "badge-gray"}`}>
                  {c.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                {c.address}, {c.pincode}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Capacity</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary-700)", marginTop: "2px" }}>{c.total_capacity}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contact Person</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>{c.contact_person}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone</div>
                  <div style={{ fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>{c.contact_phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Centre ID</div>
                  <div style={{ fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, marginTop: "2px" }}>#{c.centre_id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddCentre() {
  const [form, setForm] = useState({
    centre_name: "", address: "", city: "", state: "", pincode: "",
    total_capacity: "", contact_person: "", contact_phone: "", is_active: "1",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.centre_name.trim()) e.centre_name = "Centre name is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.total_capacity || isNaN(form.total_capacity)) e.total_capacity = "Valid capacity required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success(`Exam centre "${form.centre_name}" added successfully!`);
    setForm({ centre_name: "", address: "", city: "", state: "", pincode: "", total_capacity: "", contact_person: "", contact_phone: "", is_active: "1" });
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Add Exam Centre</div>
          <div className="page-subtitle">Register a new examination venue</div>
        </div>
      </div>
      <div className="page-body">
        <div className="form-section">
          <div className="card card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">Centre Information</div>
              <div className="form-grid mb-4">
                <div className="form-group form-grid-full">
                  <label className="form-label">Centre Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. SSN College of Engineering" {...field("centre_name")} />
                  {errors.centre_name && <span className="form-error">{errors.centre_name}</span>}
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" placeholder="Street address" {...field("address")} />
                </div>
                <div className="form-group">
                  <label className="form-label">City <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. Chennai" {...field("city")} />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">State <span className="required">*</span></label>
                  <input className="form-input" placeholder="e.g. Tamil Nadu" {...field("state")} />
                  {errors.state && <span className="form-error">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" placeholder="6-digit pincode" maxLength={6} {...field("pincode")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Capacity <span className="required">*</span></label>
                  <input type="number" className="form-input" placeholder="e.g. 500" {...field("total_capacity")} />
                  {errors.total_capacity && <span className="form-error">{errors.total_capacity}</span>}
                </div>
              </div>

              <div className="form-section-title">Contact Details</div>
              <div className="form-grid mb-6">
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input className="form-input" placeholder="Name of coordinator" {...field("contact_person")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input className="form-input" placeholder="10-digit number" maxLength={10} {...field("contact_phone")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" {...field("is_active")}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? "Saving..." : "Add Centre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

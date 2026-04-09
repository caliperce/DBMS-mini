import { useState, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import { api } from "../api";
import toast from "react-hot-toast";

export function CentreList() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCentres().then(setCentres).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Exam Centres</div><div className="page-subtitle">Registered examination venues</div></div>
        <a href="/centres/add" className="btn btn-primary"><Plus size={15} /> Add Centre</a>
      </div>
      <div className="page-body">
        {loading ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
            {centres.map((c) => (
              <div key={c.centre_id} className="card" style={{ padding: "20px" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--primary-100)", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={20} color="var(--primary-600)" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>{c.centre_name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.city}, {c.state}</div>
                  </div>
                  <span className={`badge ${c.is_active ? "badge-success" : "badge-gray"}`}>{c.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>{c.address}, {c.pincode}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
                  <div><div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Capacity</div><div style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary-700)", marginTop: "2px" }}>{c.total_capacity}</div></div>
                  <div><div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Contact</div><div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>{c.contact_person}</div></div>
                  <div><div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Phone</div><div style={{ fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>{c.contact_phone}</div></div>
                  <div><div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>ID</div><div style={{ fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>#{c.centre_id}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AddCentre() {
  const [form, setForm] = useState({ centre_name: "", address: "", city: "", state: "", pincode: "", total_capacity: "", contact_person: "", contact_phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.centre_name.trim()) e.centre_name = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.total_capacity || isNaN(form.total_capacity)) e.total_capacity = "Required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      await api.addCentre({ ...form, total_capacity: +form.total_capacity });
      toast.success(`Centre "${form.centre_name}" added!`);
      setForm({ centre_name: "", address: "", city: "", state: "", pincode: "", total_capacity: "", contact_person: "", contact_phone: "" }); setErrors({});
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const field = (name) => ({ value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Add Exam Centre</div><div className="page-subtitle">Register a new venue</div></div></div>
      <div className="page-body"><div className="form-section"><div className="card card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Centre Information</div>
          <div className="form-grid mb-4">
            <div className="form-group form-grid-full"><label className="form-label">Centre Name <span className="required">*</span></label><input className="form-input" placeholder="e.g. SSN College" {...field("centre_name")} />{errors.centre_name && <span className="form-error">{errors.centre_name}</span>}</div>
            <div className="form-group form-grid-full"><label className="form-label">Address</label><textarea className="form-textarea" {...field("address")} /></div>
            <div className="form-group"><label className="form-label">City <span className="required">*</span></label><input className="form-input" {...field("city")} />{errors.city && <span className="form-error">{errors.city}</span>}</div>
            <div className="form-group"><label className="form-label">State <span className="required">*</span></label><input className="form-input" {...field("state")} />{errors.state && <span className="form-error">{errors.state}</span>}</div>
            <div className="form-group"><label className="form-label">Pincode</label><input className="form-input" maxLength={6} {...field("pincode")} /></div>
            <div className="form-group"><label className="form-label">Capacity <span className="required">*</span></label><input type="number" className="form-input" {...field("total_capacity")} />{errors.total_capacity && <span className="form-error">{errors.total_capacity}</span>}</div>
          </div>
          <div className="form-section-title">Contact</div>
          <div className="form-grid mb-6">
            <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" {...field("contact_person")} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" maxLength={10} {...field("contact_phone")} /></div>
          </div>
          <div className="flex gap-3 justify-end"><button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? "Saving..." : "Add Centre"}</button></div>
        </form>
      </div></div></div>
    </div>
  );
}

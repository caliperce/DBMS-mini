import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  MapPin,
  Calendar,
  Ticket,
  BarChart2,
  AlertCircle,
  TrendingUp,
  Database,
  GraduationCap,
  UserPlus,
  FilePlus,
  ClipboardPlus,
  Building2,
  CalendarPlus,
  TicketPlus,
  Search,
  ListOrdered,
  MessageSquarePlus,
  MessageSquareWarning,
  PieChart,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/" },
  {
    section: "Students",
    items: [
      { label: "All Students", icon: Users, to: "/students" },
      { label: "Add Student", icon: UserPlus, to: "/students/add" },
    ],
  },
  {
    section: "Examinations",
    items: [
      { label: "All Exams", icon: BookOpen, to: "/exams" },
      { label: "Add Exam", icon: FilePlus, to: "/exams/add" },
    ],
  },
  {
    section: "Registration",
    items: [
      { label: "Registrations", icon: ClipboardList, to: "/registrations" },
      { label: "Register Student", icon: ClipboardPlus, to: "/registrations/add" },
    ],
  },
  {
    section: "Centres & Schedules",
    items: [
      { label: "Exam Centres", icon: Building2, to: "/centres" },
      { label: "Add Centre", icon: MapPin, to: "/centres/add" },
      { label: "Schedules", icon: Calendar, to: "/schedules" },
      { label: "Add Schedule", icon: CalendarPlus, to: "/schedules/add" },
    ],
  },
  {
    section: "Hall Tickets",
    items: [
      { label: "Generate Ticket", icon: TicketPlus, to: "/hall-tickets/generate" },
      { label: "View Ticket", icon: Search, to: "/hall-tickets/view" },
    ],
  },
  {
    section: "Results",
    items: [
      { label: "Add Result", icon: BarChart2, to: "/results/add" },
      { label: "Rank List", icon: ListOrdered, to: "/results/rank-list" },
    ],
  },
  {
    section: "Grievances",
    items: [
      { label: "File Grievance", icon: MessageSquarePlus, to: "/grievances/add" },
      { label: "Open Grievances", icon: MessageSquareWarning, to: "/grievances" },
    ],
  },
  {
    section: "Analytics",
    items: [
      { label: "Reports & Charts", icon: PieChart, to: "/analytics" },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <GraduationCap size={22} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-title">NEMS</div>
          <div className="sidebar-logo-subtitle">Exam Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.to) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
                end={item.to === "/"}
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            );
          }
          return (
            <div key={idx}>
              <div className="sidebar-section-label">{item.section}</div>
              {item.items.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? " active" : ""}`
                  }
                >
                  <sub.icon size={15} />
                  {sub.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div style={{
        padding: "16px 14px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        fontSize: "11px",
        color: "rgba(255,255,255,0.3)",
        lineHeight: 1.5,
      }}>
        NEMS v1.0 · DBMS Mini Project<br />
        Oracle DB · React Frontend
      </div>
    </aside>
  );
}

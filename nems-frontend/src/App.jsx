import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import { StudentList, AddStudent } from "./pages/Students";
import { ExamList, AddExam } from "./pages/Exams";
import { RegistrationList, AddRegistration } from "./pages/Registrations";
import { CentreList, AddCentre } from "./pages/Centres";
import { ScheduleList, AddSchedule } from "./pages/Schedules";
import { GenerateHallTicket, ViewHallTicket } from "./pages/HallTickets";
import { AddResult, RankList } from "./pages/Results";
import { FileGrievance, OpenGrievances } from "./pages/Grievances";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "13.5px",
            fontWeight: 500,
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
          success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          error: { iconTheme: { primary: "#e11d48", secondary: "#fff" } },
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/exams" element={<ExamList />} />
            <Route path="/exams/add" element={<AddExam />} />
            <Route path="/registrations" element={<RegistrationList />} />
            <Route path="/registrations/add" element={<AddRegistration />} />
            <Route path="/centres" element={<CentreList />} />
            <Route path="/centres/add" element={<AddCentre />} />
            <Route path="/schedules" element={<ScheduleList />} />
            <Route path="/schedules/add" element={<AddSchedule />} />
            <Route path="/hall-tickets/generate" element={<GenerateHallTicket />} />
            <Route path="/hall-tickets/view" element={<ViewHallTicket />} />
            <Route path="/results/add" element={<AddResult />} />
            <Route path="/results/rank-list" element={<RankList />} />
            <Route path="/grievances/add" element={<FileGrievance />} />
            <Route path="/grievances" element={<OpenGrievances />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

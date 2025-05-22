import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UniversityToggle } from './Pages/UniversityPortal';
import UniversityDashboard from './Pages/UniversityDashboard';
import DepartmentDashboard from './Pages/DepartmentDashboard';
import SchoolDepartments from './Pages/SchoolDepartments';
import { Toaster } from './ToastNotifications/Toaster';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UniversityToggle />} />
          <Route path="/university/:universityId/dashboard" element={<UniversityDashboard />} />
          <Route path="/department/:departmentId/dashboard" element={<DepartmentDashboard />} />
          <Route path="/school/:schoolId/departments" element={<SchoolDepartments />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;

import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UniversityToggle } from './Pages/UniversityPortal';
import UniversityDashboard from './Pages/UniversityDashboard';
import DepartmentDashboard from './Pages/DepartmentDashboard';
import SchoolDepartments from './Pages/SchoolDepartments';
import { Toaster } from './ToastNotifications/Toaster';
import { Classes } from './Pages/Classes';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UniversityToggle />} />
          <Route path="/university/:universityId/dashboard" element={<UniversityDashboard />} />
          <Route path="/school/:schoolId/departments" element={<SchoolDepartments />} />
          <Route path="/department/:departmentId/dashboard" element={<DepartmentDashboard />}/>
          <Route path='/department/:departmentId/classes' element={<Classes/>}/>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;

import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UniversityToggle } from './Pages/UniversityPortal';
import UniversityDashboard from './Pages/UniversityDashboard';
import DepartmentDashboard from './Pages/DepartmentDashboard';
import SchoolDepartments from './Pages/SchoolDepartments';
import { Toaster } from './ToastNotifications/Toaster';
import { Classes } from './Pages/Classes';
import { AssignClass } from './Pages/AssignClass'; 
import ScheduleManagement from './Pages/ScheduleManagement';
import Timetable from './Pages/Timetable';
import { RoomManagement } from './Pages/RoomManagement';


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
          {/* Fallback: assign-class without semesterId routes to Classes to select a semester */}
          <Route path='/department/:departmentId/assign-class' element={<Classes/>}/>
          <Route path='/department/:departmentId/assign-class/:semesterId' element={<AssignClass/>}/> {/* Added route */}
          <Route path='/department/:departmentId/schedules' element={<ScheduleManagement/>}/>
          <Route path='/department/:departmentId/timetable/:scheduleId' element={<Timetable/>}/>
          <Route path='/university/:universityId/rooms' element={<RoomManagement/>}/>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
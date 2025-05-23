import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UniversityToggle } from './Components/Univeristy/unitoggle';
import UniversityDashboard from './Pages/UniversityDashboard';
import DepartmentDashboard from './Pages/DepartmentDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UniversityToggle />} />
        <Route path="/university/:universityId/dashboard" element={<UniversityDashboard />} />
        <Route path="/department/:departmentId/dashboard" element={<DepartmentDashboard />} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;

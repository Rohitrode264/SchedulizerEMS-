import './App.css'
import {BrowserRouter ,Routes,Route} from "react-router-dom";
import ExcelUpload from './excelpage';
function App() {

  return (
      <div>
        <BrowserRouter>
            <Routes>
              <Route path='/excel' element={<ExcelUpload/>} />
            </Routes>
        </BrowserRouter>
      </div>
  )
}

export default App

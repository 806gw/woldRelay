import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Relay from './Relay'

function App() {

  return (
    <BrowserRouter>
      <Routes>  
        <Route path='/' element={<Relay />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

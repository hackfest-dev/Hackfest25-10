import React from 'react'
import { BrowserRouter,Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Verify from './pages/Verify'
import Register from './pages/Register'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path='dashboard' element={<Dashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
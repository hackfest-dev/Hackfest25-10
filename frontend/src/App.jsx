import React from 'react'
import { BrowserRouter,Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Verify from './pages/Verify'
import Register from './pages/Register'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import CheckoutPage from './pages/CheckOut'
import Buyer from './pages/Buyer'
import Lender from './pages/Lender'
import Requests from './pages/Requests'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path='dashboard' element={<Dashboard />}/>
        <Route path='/checkout/:id' element={<CheckoutPage />}/>
        <Route path="/buyer-dashboard" element={<Buyer />} />
        <Route path="/lender-dashboard" element={<Lender />} />
        <Route path='/lender/requests' element={<Requests />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
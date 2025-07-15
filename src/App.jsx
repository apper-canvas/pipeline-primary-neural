import React from 'react'
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import { UserProvider } from '@/context/UserContext'
import Header from "@/components/organisms/Header";
import Contacts from "@/components/pages/Contacts";
import Pipeline from "@/components/pages/Pipeline";
import Dashboard from "@/components/pages/Dashboard";
import Activities from "@/components/pages/Activities";
import Leads from "@/components/pages/Leads";

function App() {
return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
<Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/activities" element={<Activities />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App;
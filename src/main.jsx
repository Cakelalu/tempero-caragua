import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import SiteLayout from './layouts/SiteLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import Home from "./pages/Home"
import Contact from "./pages/Contact"
import Register from "./pages/Register"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="/contato" element={<Contact />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/cadastro" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
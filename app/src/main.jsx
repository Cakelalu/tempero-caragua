import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import SiteLayout from './layouts/SiteLayout'
import ErrorLayout from './layouts/ErrorLayout'
import Contact from "./pages/Contact"
import CreatePost from './pages/CreatePost'
import EditProfile from './pages/EditProfile'
import Especiais from './pages/Especiais'
import Favorites from './pages/Favorites'
import Festivals from './pages/Festivals'
import Home from "./pages/Home"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Post from './pages/Post'
import Posts from './pages/Posts'
import Register from "./pages/Register"
import Profile from './pages/Profile'
import { ThemeProvider, initThemeMode } from "flowbite-react";

initThemeMode();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/criar" element={<CreatePost />} />
            <Route path="/editar-perfil" element={<EditProfile />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/festivais" element={<Festivals />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<Post />} />
            <Route path="/especiais-de-caragua" element={<Especiais />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/cadastro" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ErrorLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
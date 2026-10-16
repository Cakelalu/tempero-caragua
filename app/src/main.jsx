import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout.jsx'
import SiteLayout from './layouts/SiteLayout.jsx'
import ErrorLayout from './layouts/ErrorLayout.jsx'
import Account from './pages/Account.jsx'
import Contact from "./pages/Contact"
import CreatePost from './pages/CreatePost.jsx'
import EditProfile from './pages/EditProfile.jsx'
import Especiais from './pages/Especiais.jsx'
import Favorites from './pages/Favorites.jsx'
import Festivals from './pages/Festivals.jsx'
import Home from "./pages/Home"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Post from './pages/Post.jsx'
import Posts from './pages/Posts.jsx'
import Register from "./pages/Register"
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
            <Route path="/u/:id" element={<Account />} />
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
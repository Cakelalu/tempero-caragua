import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router'
import AuthLayout from './layouts/AuthLayout.jsx'
import SiteLayout from './layouts/SiteLayout.jsx'
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


createRoot(document.getElementById('root')).render(
  <StrictMode>
        <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/u/:id" element={<Account />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/edit-profile" element={<EditProfile />} />
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
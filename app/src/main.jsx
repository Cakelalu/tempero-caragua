import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
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
import Moderador from './pages/Moderador'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { ThemeProvider, initThemeMode } from "flowbite-react";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

initThemeMode();

// Componente que escuta expiração de token e redireciona para o login
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
      if (window.location.pathname !== "/login") {
        navigate("/login");
      }
    };

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [navigate]);

  return null;
}

// Componente que controla inatividade real do usuário (8 minutos)
function InactivityWatcher() {
  const navigate = useNavigate();
  const INACTIVITY_LIMIT = 8 * 60 * 1000; // 8 minutos

  useEffect(() => {
    let timeoutId;

    const logoutOnInactivity = () => {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
      if (window.location.pathname !== "/login") {
        navigate("/login");
      }
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutOnInactivity, INACTIVITY_LIMIT);
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, true);
    });

    // Inicializa o timer ao montar
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, [navigate]);

  return null;
}

// Intercepta respostas 401 de qualquer fetch e dispara logout automático
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  if (response.status === 401) {
    window.dispatchEvent(new Event("auth-expired"));
  }
  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthListener />
          <InactivityWatcher />
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<Home />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/perfil/:id" element={<Profile />} />
              <Route path="/criar" element={<CreatePost />} />
              <Route path="/editar-perfil" element={<EditProfile />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/festivais" element={<Festivals />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/:id" element={<Post />} />
              <Route path="/especiais-de-caragua" element={<Especiais />} />
              <Route path="/moderador" element={<Moderador />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/cadastro" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/esqueci-minha-senha" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route element={<ErrorLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
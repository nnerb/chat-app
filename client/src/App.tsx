import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import HomePage from "./pages/home/home";
import SignUpPage from "./pages/sign-up";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";
import SettingsPage from "./pages/settings/settings";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { useThemeStore } from "./store/useThemeStore";
import Loading from "./components/skeletons/loading";

const App = () => {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
    document.documentElement.setAttribute("data-theme", theme);
  }, [checkAuth, theme])

  if (isCheckingAuth && !authUser) return <Loading />

  return ( 
    <div data-theme={theme} className="w-full min-h-screen">
      <Navbar />
      <Routes>
        <Route 
          path="/messages" 
          element={authUser ? <HomePage /> : <Navigate to="/login"/>}
        />
        <Route 
          path="/messages/:conversationId" 
          element={authUser ? <HomePage /> : <Navigate to="/login"/>}
        />
        <Route 
          path="/signup" 
          element={!authUser ? <SignUpPage /> : <Navigate to="/messages"/>}
        />
        <Route 
          path="/login" 
          element={!authUser ? <LoginPage /> : <Navigate to="/messages"/>}
        />
        <Route 
          path="/profile" 
          element={authUser ? <ProfilePage /> : <Navigate to="/login"/>}
        />
        <Route 
          path="/settings" 
          element={<SettingsPage/>}
        />
        <Route 
          path="*" 
          element={<Navigate to="/messages" />}
        />
      </Routes>
    </div>
   );
}
 
export default App;
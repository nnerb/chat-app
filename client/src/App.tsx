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
import { useCheckAuth } from "./features/auth/hooks";
import { useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "./protected-route";

const App = () => {

  const { authUser, isLoggingOut, isCheckingAuth, setQueryClient } = useAuthStore()
  const { mutate: checkAuth } = useCheckAuth()
  const { theme } = useThemeStore()
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    setQueryClient(queryClient);
  }, [setQueryClient, queryClient])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme])

  if ((isCheckingAuth && !authUser) || isLoggingOut) return <Loading />

  return ( 
    <div data-theme={theme} className="w-full min-h-screen">
      <Navbar />
      <Routes>
        <Route element={<ProtectedRoute/>}>
          <Route path="messages/:conversationId?" element={<HomePage />}/>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        {/* Public Routes */}
        <Route path="signup" element={!authUser ? <SignUpPage /> : <Navigate to="/messages" />} />
        <Route path="login" element={!authUser ? <LoginPage /> : <Navigate to="/messages" />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/messages" />} />
      </Routes>
    </div>
   );
}
 
export default App;
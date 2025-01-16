import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import HomePage from "./pages/home/home";
import SignUpPage from "./pages/sign-up";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";
import SettingsPage from "./pages/settings/settings";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
    document.documentElement.setAttribute("data-theme", theme);
  }, [checkAuth, theme])

  console.log(authUser)

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen" data-theme={theme}>
        <Loader2 className="size-10 animate-spin"/>
      </div>
    )
  }

  

  return ( 
    <div data-theme={theme} className="w-full min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/"/>}/>
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/"/>}/>
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login"/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
      </Routes>
    </div>
   );
}
 
export default App;
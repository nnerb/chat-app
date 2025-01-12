import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import HomePage from "./pages/home";
import SignUpPage from "./pages/sign-up";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";
import SettingsPage from "./pages/settings";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const App = () => {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-10 animate-spin"/>
      </div>
    )
  }

  return ( 
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/signup" element={<SignUpPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/settings" element={<SettingsPage />}/>
      </Routes>
    </div>
   );
}
 
export default App;
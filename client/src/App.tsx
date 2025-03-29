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
import NoChatSelected from "./components/no-chat-selected";
import ChatContainer from "./pages/home/components/chat-container";
import { useMessageStore } from "./store/useMessageStore";
import NotFound from "./components/not-found";
import ChatHeader from "./pages/home/components/chat-header";
import MessageSkeleton from "./components/skeletons/message-skeleton";
import MessageInput from "./pages/home/components/message-input";
import ProtectedRoute from "./protected-route";
import { useCheckAuth } from "./features/auth/hooks";

const App = () => {

  const { authUser, isLoggingOut } = useAuthStore()
  const { mutate: checkAuth, isPending: isCheckingAuth } = useCheckAuth()
  const { validConversationId, isMessagesLoading  } = useMessageStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [ theme])

  if (isCheckingAuth && !authUser || isLoggingOut) return <Loading />

  return ( 
    <div data-theme={theme} className="w-full min-h-screen">
      <Navbar />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="messages" element={<HomePage />}>
            <Route index element={<NoChatSelected />} />
            <Route 
              path=":conversationId" 
              element={
                validConversationId 
                  ? <ChatContainer /> 
                  : isMessagesLoading 
                  ? <div className="flex-1 flex flex-col">
                      <ChatHeader />
                      <MessageSkeleton />
                      <MessageInput />
                    </div> 
                  : <NotFound />
              }
            />
          </Route>
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
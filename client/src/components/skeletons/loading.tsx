import { Loader2 } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

const Loading = () => {

  const { theme } = useThemeStore()
  return ( 
    <div className="flex items-center justify-center h-screen w-full" data-theme={theme}>
      <Loader2 className="size-10 animate-spin"/>
    </div>
   );
}
 
export default Loading;
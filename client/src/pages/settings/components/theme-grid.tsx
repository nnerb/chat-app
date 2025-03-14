import { THEMES } from "../../../constants";
import { useThemeStore } from "../../../store/useThemeStore";

const ThemeGrid = () => {
  
  const { theme, setTheme } = useThemeStore();

  return ( 
    <div className="grid grid-cols-3 sm:grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
      {THEMES.map((t) => (
        <button
          key={t}
          className={`
            group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
            ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
          `}
          onClick={() => setTheme(t)}
        >
          <div className="relative w-full rounded-md" data-theme={t}>
            <div className="flex justify-center gap-px p-1 items-center">
              <div className="rounded-sm bg-primary size-7 w-full"></div>
              <div className="rounded-sm bg-secondary size-7 w-full"></div>
              <div className="rounded-sm bg-accent size-7 w-full"></div>
              <div className="rounded-sm bg-neutral size-7 w-full"></div>
            </div>
          </div>
          <span className="text-[11px] font-medium truncate w-full text-center">
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </span>
        </button>
      ))}
    </div>
   );
}
 
export default ThemeGrid;

import ChatPreview from "./components/chat-preview";
import SettingsHeader from "./components/settings-header";
import ThemeGrid from "./components/theme-grid";

const SettingsPage = () => {

  return (
    <div className="min-h-screen container mx-auto px-4 max-w-5xl flex flex-col justify-center">
      <div className="space-y-6 pt-20 pb-12">
        <SettingsHeader title="Theme" description="Pick a theme for your chat interface"/>
        <ThemeGrid/>
        {/* Preview Section */}
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
       <ChatPreview />
      </div>
    </div>
  );
};
export default SettingsPage;
interface SettingsHeaderProps  {
  title: string;
  description: string;
}
const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title,
  description
}) => {
  return ( 
    <header className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-base-content/70">{description}</p>
    </header>
   );
}
 
export default SettingsHeader;
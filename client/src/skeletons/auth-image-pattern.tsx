interface AuthImagePatternProps {
  title: string;
  subtitle: string;
}

const AuthImagePattern: React.FC<AuthImagePatternProps> = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-xs text-center">
        {/* Enhanced grid pattern */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-primary/10 transition-transform duration-500 ease-in-out ${
                i % 2 === 0
                  ? "animate-pulse scale-95"
                  : "hover:scale-110 hover:rotate-6"
              }`}
            />
          ))}
        </div>
        {/* Title and Subtitle */}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;

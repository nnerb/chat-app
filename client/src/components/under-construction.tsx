const UnderConstruction = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
      <div className="max-w-md w-full bg-base-200 rounded-lg shadow-lg overflow-hidden border-2 border-dashed border-yellow-500">
        <div className="bg-yellow-400 p-4">
          <h1 className="text-3xl font-bold text-center text-yellow-800">
            🚧 Under Construction 🚧
          </h1>
        </div>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">👷🔨🏗️</div>
          <p className="text-primary-content mb-4">
            Oops! This page is currently being built. Check back later!
          </p>
          <div className="mt-6 animate-bounce">
            <svg
              className="w-10 h-10 mx-auto text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
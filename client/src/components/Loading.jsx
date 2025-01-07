const Loading = ({ size = "4rem", fullScreen = false }) => {
  return (
    <div
      className={`w-full ${
        fullScreen
          ? "flex items-center justify-center min-h-screen"
          : "flex items-center justify-center"
      }`}
    >
      <div
        className="border-4 border-blue-500 border-dashed rounded-full animate-spin"
        style={{ width: size, height: size }}
      ></div>
    </div>
  );
};

export default Loading;

function Alert({ type, message }) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-lg text-sm shadow-lg transition-all ${
        type === "success"
          ? "bg-green-600 text-white"
          : "bg-orange-600 text-white"
      }`}
    >
      {message}
    </div>
  );
}

export default Alert;

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-6 text-center text-sm text-gray-400">
      Don't have an account?{" "}
      <Link
        to="/register"
        className="text-blue-400 hover:text-blue-300 underline transition-colors"
      >
        Register here
      </Link>
    </footer>
  );
};

export default Footer;

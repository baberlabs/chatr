import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-6 text-center text-sm text-gray-400">
      Already have an account?{" "}
      <Link
        to="/login"
        className="text-blue-400 hover:text-blue-300 underline transition-colors"
      >
        Login here
      </Link>
    </footer>
  );
};

export default Footer;

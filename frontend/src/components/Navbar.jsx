import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { isLoggingOut, logout, authUser } = useAuthStore();

  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/">Home</Link>
          </li>

          {!authUser && (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
          <li>
            <Link to="/profile">Profile</Link>
          </li>

          <li>
            <Link to="/settings">Settings</Link>
          </li>
          {authUser && (
            <li className="font-bold text-red-500">
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className={`${
                  isLoggingOut ? "cursor-progress" : "cursor-pointer"
                }`}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;

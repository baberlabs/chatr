import { Link } from "react-router-dom";
import { MessageSquareText, Settings, User } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

const Navbar = () => {
  const { authUser } = useAuthStore();

  return (
    <div>
      <nav className="bg-gray-900 text-gray-100 shadow-sm border-r border-gray-800">
        <ul className="flex flex-col space-y-4 gap-1.5 min-h-screen justify-end p-4">
          <li className="flex items-center border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition">
            {authUser ? (
              <Link to="/">
                <MessageSquareText className="text-gray-100" />
              </Link>
            ) : (
              <div>
                <MessageSquareText className="text-gray-600" />
              </div>
            )}
          </li>

          <li className="flex items-center border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition">
            {authUser ? (
              <Link to="/profile">
                <User className="text-gray-100" />
              </Link>
            ) : (
              <div>
                <User className="text-gray-600" />
              </div>
            )}
          </li>

          <li className="flex items-center border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition">
            <Link to="/settings">
              <Settings className="text-gray-100" />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;

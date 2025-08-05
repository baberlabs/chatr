import { BotMessageSquare } from "lucide-react";

const Header = () => {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <BotMessageSquare className="size-8 text-blue-400 hover:text-red-500 hover:scale-120 hover:-rotate-8 transition-all" />
        <h1 className="text-3xl font-black text-blue-400">Chatr</h1>
      </div>
      <h2 className="text-2xl font-bold">Register</h2>
    </header>
  );
};

export default Header;

import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import Footer from "./components/Footer";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-700 text-gray-100 p-4">
      <div className="w-full max-w-md">
        <Header />
        <LoginForm />
        <Footer />
      </div>
    </div>
  );
};

export default LoginPage;

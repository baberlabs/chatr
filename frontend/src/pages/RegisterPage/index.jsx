import Header from "./components/Header";
import RegisterForm from "./components/RegisterForm";
import Footer from "./components/Footer";

const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-700 text-gray-100 p-4">
      <div className="w-full max-w-md">
        <Header />
        <RegisterForm />
        <Footer />
      </div>
    </div>
  );
};

export default RegisterPage;

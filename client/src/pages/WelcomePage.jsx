import React from "react";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Task Management Application
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Manage your projects, tasks, and teams with ease.
        </p>

        {/* 🔹 Button Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <button
            onClick={() => navigate("/admin-login")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Login as Admin
          </button>

          <button
            onClick={() => navigate("/log-in")}
            className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Login as User
          </button>

          <button
            onClick={() => navigate("/register")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 text-lg font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Create Account
          </button>
        </div>

        {/* 🔹 About Section */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About Us</h2>
          <p className="text-gray-600 leading-relaxed">
            We are a passionate team of developers and designers dedicated to building intuitive
            and efficient productivity tools. This Task Management Application was created to help
            teams collaborate seamlessly, assign tasks with clarity, and track progress in real time.
            Whether you're working in a startup, a growing team, or managing personal projects, our
            mission is to simplify task management and foster team accountability through modern,
            user-friendly interfaces.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;

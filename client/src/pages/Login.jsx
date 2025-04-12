import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLoginMutation, useForgotPasswordMutation } from '../redux/slices/api/authApiSlice';
import { setCredentials } from '../redux/slices/authSlice';
import { toast } from 'sonner';
import Loading from '../components/Loader';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: resetRegister, handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [login, { isLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: isResetting }] = useForgotPasswordMutation();
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res));
      toast.success("Login successful!");
      navigate('/');
    } catch (error) {
      toast.error("Invalid credentials.");
    }
  };

  const handleForgotPassword = async (data) => {
    try {
      await forgotPassword(data).unwrap();
      toast.success("Reset link sent!");
      setShowForgotModal(false);
    } catch (error) {
      toast.error("Failed to send reset link.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#B9B7F2] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">

        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-1 text-[#111827]">Welcome Back!</h1>
          <p className="text-gray-600 mb-8">Please enter login details below</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter the email"
                className="mt-1 block w-full rounded-md border px-4 py-2 outline-none"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter the Password"
                className="mt-1 block w-full rounded-md border px-4 py-2 outline-none"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot password?
              </button>
            </div>

            {isLoading ? (
              <Loading />
            ) : (
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                Sign in
              </button>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex-grow border-t" />
              or continue
              <span className="flex-grow border-t" />
            </div>

            <button className="w-full border py-2 flex justify-center items-center gap-2 rounded-md">
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google logo" />
              Log in with Google
            </button>

            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <a href="/register" className="text-blue-600 hover:underline">Sign Up</a>
            </p>
          </form>
        </div>

        {/* Right Side: Illustration */}
        <div className="w-full md:w-1/2 bg-[#C6C5F9] flex items-center justify-center p-6">
          <div className="text-center">
            <img
              src="/Task-Illustration.webp"
              alt="Illustration"
              className="mx-auto w-95% h-80%"
            />
            <p className="text-gray-800 font-serif text-xl">
              Manage your task in an easy and more efficient way!!!
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
            <form onSubmit={handleResetSubmit(handleForgotPassword)} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="border w-full px-4 py-2 rounded-md"
                {...resetRegister("email", { required: "Email is required" })}
              />
              {resetErrors.email && <p className="text-red-500 text-sm">{resetErrors.email.message}</p>}

              {isResetting ? (
                <Loading />
              ) : (
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
                  Send Reset Link
                </button>
              )}
            </form>
            <button
              className="mt-4 text-sm text-gray-600 hover:underline"
              onClick={() => setShowForgotModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

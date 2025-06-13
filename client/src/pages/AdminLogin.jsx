import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { toast } from "sonner";
import Loading from "../components/Loader";

const AdminLogin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (user?.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();

      if (!res.isAdmin) {
        toast.error("Not authenticated as Admin");
        return;
      }

      dispatch(setCredentials(res));
      toast.success("Admin login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Invalid credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fdecea] px-4">
      <div className="bg-[#f8d7da] rounded-2xl shadow-lg p-8 w-full max-w-md border border-[#f5c6cb]">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter e-mail"
              className="mt-1 block w-full border rounded-md px-4 py-2 outline-none"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="mt-1 block w-full border rounded-md px-4 py-2 outline-none"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {isLoading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Sign in as Admin
            </button>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Not an admin? <a href="/log-in" className="text-blue-600 hover:underline">Login as User</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

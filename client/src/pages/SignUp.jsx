import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;

    try {
      await registerUser(userData).unwrap();
      toast.success("Account created successfully!");
      navigate("/log-in");
    } catch (error) {
      const errMessage = error?.data?.message || "Something went wrong. Please try again!";
      toast.error(errMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eae6fd] px-4">
      <div className="bg-white rounded-xl shadow-2xl flex w-full max-w-6xl overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">Welcome!</h2>
          <p className="text-sm text-gray-600 mb-6">Please fill in the details to create an account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="Full Name"
                className="w-full p-3 border rounded-md"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="Email Address"
                className="w-full p-3 border rounded-md"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <input
                type="text"
                {...register("role", { required: "Role is required" })}
                placeholder="Role (e.g. Admin or Employee)"
                className="w-full p-3 border rounded-md"
              />
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>

            <div>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                placeholder="Title"
                className="w-full p-3 border rounded-md"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <select
                {...register("gender", { required: "Gender is required" })}
                className="w-full p-3 border rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
                </select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>

            <div>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" }
                })}
                placeholder="Password"
                className="w-full p-3 border rounded-md"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === watch("password") || "Passwords do not match"
                })}
                placeholder="Confirm Password"
                className="w-full p-3 border rounded-md"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium"
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
              <span>Already have an account?</span>
              <Link to="/log-in" className="text-blue-600 font-medium hover:underline">
                Log In
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-[#d8d4f7] items-center justify-center p-6">
          <div className="text-center">
            <img
              src="/Task-Illustration.webp"
              alt="illustration"
              className="mx-auto w-95% h-80%"
            />
            <p className="text-gray-800 font-serif text-xl">Manage your task in an easy and more efficient way!!!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

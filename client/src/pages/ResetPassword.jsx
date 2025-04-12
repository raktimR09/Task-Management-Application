import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import Textbox from "../components/Textbox";
import Button from "../components/Button";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      console.log("Sending to backend:", { token, password: data.password }); // DEBUG

      const response = await axios.post("http://localhost:8800/api/user/reset-password", {
        token,
        password: data.password,
      });

      toast.success(response.data.message || "Password reset successful");
      navigate("/log-in");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white px-10 py-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Reset Password</h2>
        <div className="flex flex-col gap-4">
          <Textbox
            label="New Password"
            type="password"
            placeholder="Enter new password"
            name="password"
            register={register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            })}
            error={errors.password?.message}
          />

          <Textbox
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            name="confirmPassword"
            register={register("confirmPassword", {
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            label={loading ? "Resetting..." : "Reset Password"}
            className="w-full bg-blue-700 text-white rounded-full"
          />
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

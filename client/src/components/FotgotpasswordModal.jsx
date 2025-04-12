import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useForgotPasswordMutation } from '../redux/slices/api/authApiSlice';
import { toast } from 'sonner';
import Loading from './Loader';

const ForgotPasswordModal = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data).unwrap();
      toast.success("Reset link sent to your email!");
      onClose();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="border p-2 rounded"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          {isLoading ? <Loading /> : (
            <button type="submit" className="bg-blue-600 text-white rounded-full py-2">
              Send Reset Link
            </button>
          )}
        </form>
        <button
          className="mt-4 text-sm text-gray-500 hover:underline"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

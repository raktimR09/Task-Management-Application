import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// import { login } from '../redux/slices/authSlice'; // Ensure correct path
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useLoginMutation } from '../redux/slices/api/authApiSlice';
import Loading from '../components/Loader';
import { setCredentials } from '../redux/slices/authSlice';
import { toast } from 'sonner';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const [login,{isLoading}]=useLoginMutation();

    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth); // Get user from Redux

    // Redirect to dashboard if already logged in
    useEffect(() => {
        user &&
            navigate("/dashboard");
    }, [user]);

    const submitHandler = async (data) => {
        console.log("Submitting data:", data); // Debugging
        try {
            const result = await login(data).unwrap();
            dispatch(setCredentials(result));
            navigate("/");
            console.log("Login successful:", result);
            toast.success("Login Successful");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Invalid email or password. Try again!");
        }
    };
    

    return (    
        <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
            <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
                {/* Left Side */}
                <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
                    <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
                        <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600'>
                            Manage all your tasks in one place!
                        </span>
                        <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700'>
                            <span>Task Management</span>
                            <span>Application</span>
                        </p>
                        <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
          </div>
        </div>

                {/* Right Side */}
                <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
                    <form onSubmit={handleSubmit(submitHandler)}
                        className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14'>
                        <div>
                            <p className='text-blue-600 text-3xl font-bold text-center'>Welcome Back!</p>
                            <p className='text-center text-base text-gray-700'>Keep all your credentials safe.</p>
                        </div>
                        <div className='flex flex-col gap-y-5'>
                            <Textbox
                                placeholder='email@example.com'
                                type='email'
                                name='email'
                                label='Email Address'
                                className='w-full rounded-full'
                                register={register("email", {
                                  required: "Email Address is required!",
                                })}
                                error={errors.email ? errors.email.message : ""}
                            />
                            <Textbox
                                placeholder='Enter your password here...'
                                type='password'
                                name='password'
                                label='Password'
                                className='w-full rounded-full'
                                register={register("password", {
                                  required: "Password is required!",
                                })}
                                error={errors.password ? errors.password.message : ""}
                            />
                            <span className='text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer'>
                Forgot Password?
              </span>
                            {isLoading?(
                                <Loading/>
                            ):(
                                <Button
                                    type='submit'
                                    label='Submit'
                                    className='w-full h-10 bg-blue-700 text-white rounded-full'
                                />
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
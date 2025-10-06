"use client";
import GoogleButton from "@/shared/components/google-button";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";

type Formdata = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<Formdata | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showOtp, setShowOtp] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Formdata>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: Formdata) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`,
        data
      );
      return response.data;
    },

    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`,
        { ...userData, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const onSubmit = (data: Formdata) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      //const newOtp = [...otp];
      //newOtp[index - 1] = "";
      //setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      // Logic to resend OTP
      signupMutation.mutate(userData);
    }
  };

  //   React.useEffect(() => {
  //     let interval: NodeJS.Timeout;
  //     if (!canResend) {
  //       interval = setInterval(() => {
  //         setTimer((prev) => {
  //           if (prev === 1) {
  //             setCanResend(true);
  //             clearInterval(interval);
  //             return 60;
  //           }
  //           return prev - 1;
  //         });
  //       }, 1000);
  //     }
  //     return () => clearInterval(interval);
  //   }, [canResend]);

  //   React.useEffect(() => {
  //     if (showOtp) {
  //       inputRefs.current[0]?.focus();
  //     }
  //   }, [showOtp]);

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Sign up
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Sign up
      </p>
      <div className=" w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Sign up to Eshop
          </h3>
          <p className="text-center text-grey-500 mb-6">
            Already have an account?{" "}
            <Link href={"/login"} className="text-red-500">
              Login
            </Link>
          </p>
          <GoogleButton title="Sign up with Google" />
          <div className="flex items-center my-5 text-grey-400 text-sm">
            <div className="flex-1 border-t border-grey-300"></div>
            <span className="px-3">or Sign up with Email</span>
            <div className="flex-1 border-t border-grey-300"></div>
          </div>
          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Justice Kc"
                className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mb-2">
                  {String(errors.name.message)}
                </p>
              )}

              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="smartcode.kc@gmail.com"
                className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mb-2">
                  {String(errors.email.message)}
                </p>
              )}

              <label className="block text-gray-700 mb-1 mt-4">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 cursor-pointer text-gray-500"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>

                {errors.password && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              <button
                disabled={signupMutation.isPending}
                type="submit"
                className="w-full text-lg cursor-pointer mt-4 bg-[#C6223B] text-white p-2 rounded-[4px] hover:bg-red-400 transition"
              >
                {signupMutation.isPending ? "Signing up..." : " Sign up "}
              </button>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 rounded-[4px]"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
                type="submit"
                className="w-full mt-10 text-lg cursor-pointer bg-[#C6223B] text-white p-2 rounded-[4px] hover:bg-red-500 transition"
              >
                {verifyOtpMutation.isPending
                  ? "Verifying OTP..."
                  : " Verify OTP "}
              </button>
              <p className="text-center mt-4 text-sm">
                {canResend ? (
                  <button
                    className="text-red-400 mt-4 font-medium cursor-pointer"
                    onClick={resendOtp}
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
              {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mb-2">
                    {verifyOtpMutation.error.response?.data?.message ||
                      verifyOtpMutation.error.message}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

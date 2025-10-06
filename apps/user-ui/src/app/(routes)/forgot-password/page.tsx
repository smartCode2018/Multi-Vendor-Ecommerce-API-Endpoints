"use client";

import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type Formdata = {
  email: string;
  password: string;
};

const ForgotPassowrd = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);

  const [serverError, setServerError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      //   console.log("here");
      //   console.log(email);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`,
        { email }
      );
      return response.data;
    },

    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "invalid OTP. Try again";
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-user`,
        { email: userEmail, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "invalid OTP. Try again";
      setServerError(errorMessage);
    },
  });

  //call reset password api endpoint
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      console.log({
        email: userEmail,
        password: password,
      });
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`,
        { email: userEmail, newPassword: password }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success(
        "Password reset successfully! Please loagin with your new password."
      );
      setServerError(null);
      router.push("/login");
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to reset password. Try again!";
      setServerError(errorMessage);
    },
  });

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

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const onSubmitpassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot-passowrd
      </p>
      <div className=" w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step === "email" && (
            <div>
              <h3 className="text-2xl font-semibold text-center mb-2">
                Reset your password
              </h3>
              <p className="text-center text-grey-500 mb-6">
                Go back to?{" "}
                <Link href={"/login"} className="text-red-500">
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)}>
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

                <button
                  disabled={requestOtpMutation.isPending}
                  type="submit"
                  className="w-full text-lg mt-4 cursor-pointer bg-[#C6223B] text-white p-2 rounded-[4px] hover:bg-red-500 transition"
                >
                  {requestOtpMutation?.isPending ? "Sending OTP ..." : "Submit"}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </div>
          )}

          {step === "otp" && (
            <>
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
                      onClick={() =>
                        requestOtpMutation.mutate({ email: userEmail! })
                      }
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <h3 className="text-2xl font-semibold text-center mb-2">
                Reset your password
              </h3>
              <form onSubmit={handleSubmit(onSubmitpassword)}>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
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
                {errors.password && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.password.message)}
                  </p>
                )}

                <button
                  disabled={resetPasswordMutation.isPending}
                  type="submit"
                  className="w-full text-lg cursor-pointer mt-4 bg-[#C6223B] text-white p-2 rounded-[4px] hover:bg-red-400 transition"
                >
                  {resetPasswordMutation.isPending
                    ? "Resetting ..."
                    : " Reset Password "}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassowrd;

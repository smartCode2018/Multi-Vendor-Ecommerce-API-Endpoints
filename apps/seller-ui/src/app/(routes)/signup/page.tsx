"use client";

import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { countries } from "@/utils/country";
import CreateShop from "@/shared/modules/auth/create-shop";
import StripeLogo from "@/assets/svg/stripelogo";

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<any | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showOtp, setShowOtp] = useState(false);
  const [sellerId, setSellerId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`,
        data
      );
      return response.data;
    },

    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`,
        { ...sellerData, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: (data) => {
      //console.log({ seller: data.seller });
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  const onSubmit = (data: any) => {
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
    if (sellerData) {
      // Logic to resend OTP
      signupMutation.mutate(sellerData);
    }
  };

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`,
        { sellerId }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe connection error:", error);
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
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      {/* {Stepper} */}
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
        {[1, 2, 3].map((step) => (
          <div className="" key={step}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                step <= activeStep ? "bg-red-600" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            <span className="ml-[-15px]">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>
      {/* Steps content */}
      <div className="md:w-[480px] mt-20 p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">
                  Create Account
                </h3>
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

                <label className="block text-gray-700 mb-1 mt-4">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+23481661*****"
                  className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                  {...register("phone_number", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\+?[\d\s-]{7,15}$/, // follows E.164 format
                      message: "Invalid phone number format.",
                    },
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 digits.",
                    },
                    maxLength: {
                      value: 15,
                      message: "Phone number must not be more than 15 digits.",
                    },
                  })}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.phone_number.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1 mt-4">Country</label>
                <select
                  className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                  {...register("country", { required: "Country is required" })}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.country.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1 mt-4">
                  Password
                </label>
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
                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}

                <p className="pt-3 text-center">
                  Already have an account?{" "}
                  <Link href={"/login"} className="text-red-500">
                    Login
                  </Link>
                </p>
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
          </>
        )}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <br />
            <button
              onClick={connectStripe}
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg"
            >
              Connect Stripe <StripeLogo />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;

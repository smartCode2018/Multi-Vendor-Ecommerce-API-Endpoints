import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";
import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
//import emailbd from "./email-templates/user-activation-email";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`missing required fields`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`invalid email format`);
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attemtes! try again in 30 minutes"
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many OTP requst please wait 1hour before requesting again"
      )
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError("Please wait 1minute before requesting a new OTP!")
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // lock for 1hour
    return next(
      new ValidationError("Too many OTP request. Please try again after 1hour.")
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); // tracking request for 1hour
};

export const sendOtp = async (
  name: string,
  email: string,
  emailTemplate: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  //load email template and send email
  //const emailtemplate = emailbd(name, otp);

  await sendEmail(email, "Your OTP Code", emailTemplate, { name, otp });

  await redis.set(`otp:${email}`, otp, "EX", 300); // Store OTP in Redis for 5 minutes
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // Set cooldown for 1 minute
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("OTP expired. Please request a new one.");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  let failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // lock for 30 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey); // delete the otp

      throw new ValidationError(
        "Account locked due to multiple failed attemtes! try again in 30 minutes"
      );
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 1800); // track failed attempts for 30 minutes
    throw new ValidationError(
      `Invalid OTP. Please try again. ${2 - failedAttempts} attempts left.`
    );
  }
  await redis.del(`otp:${email}`, failedAttemptsKey); // OTP is valid, delete it
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    //Find user/seller in the database
    const user =
      userType === "user"
        ? await prisma.users.findUnique({
            where: { email },
          })
        : await prisma.sellers.findUnique({
            where: { email },
          });

    if (!user) {
      throw new ValidationError(`No ${userType} found with this email`);
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    //send otp
    await sendOtp(
      user.name,
      email,
      userType === "user"
        ? "user-forgot-password-mail"
        : "seller-forgot-password-mail"
    );

    res.status(200).json({
      message: "OTP sent to email. Please verify to reset your password",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError("Missing required fields");
    }
    await verifyOtp(email, otp, next);
    res.status(200).json({
      message: "OTP verified. You can now reset your password",
    });
  } catch (error) {
    return next(error);
  }
};

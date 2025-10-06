import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
//import { PrismaClient } from "@prisma/client";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// 2025-02-24.acacia
// 2025-08-27.basil

import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utills/auth.helper";

import {
  AuthenticationError,
  ValidationError,
} from "../../../../packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "./cookies/setCookie";

//register user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError("User with this email already exists"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "otp-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    return next(error);
  }
};

//verify user otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("Missing required fields"));
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError("User with this email already exists"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//login user
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Missing required fields"));
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AuthenticationError("Invalid email or password"));
    }

    //check password
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return next(new AuthenticationError("Invalid email or password"));
    }

    res.clearCookie("seller_accessToken");
    res.clearCookie("seller_refreshToken");

    //generate token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    //refresh token
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    //store refresh token and access token in an httpOnly cookie
    setCookie(res, "refreshToken", refreshToken);
    setCookie(res, "accessToken", accessToken);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

//refresh token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refreshToken"] ||
      req.cookies["seller_refreshToken"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthenticationError("Forbidden! User/Seller not found");
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    if (decoded.role === "user") {
      setCookie(res, "accessToken", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller_accessToken", newAccessToken);
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// forgot password password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);
  await handleForgotPassword(req, res, next, "user");
};

//verify otp for forgot password
export const verifyForgotPasswordUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyForgotPasswordOtp(req, res, next);
  } catch (error) {
    next(error);
  }
};

// reset password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError("Missing required fields"));
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user)
      return next(new ValidationError("No user found with this email"));

    //compare password with the existing password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password must be different from the old password"
        )
      );
    }

    //hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password in the database
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exists with this email");
    }
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "otp-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    next(error);
  }
};

//verify seller with OTP
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    //console.log(req.body);

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("All fields are required"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(new ValidationError("User with this email already exists"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res.status(201).json({
      success: true,
      message: "Seller registered successfully",
      seller,
    });
  } catch (error) {
    next(error);
  }
};

//create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      return next(new ValidationError("All fields are required"));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      website,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

//create strip connect account link
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) return next(new ValidationError("seller ID is required"));

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller)
      return next(new ValidationError("Seller is not available with this ID!"));

    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: {
          requested: true,
        },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

//login seller
export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Missing required fields"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      return next(new AuthenticationError("Invalid email or password"));
    }

    //check password
    const isPasswordValid = await bcrypt.compare(password, seller.password!);
    if (!isPasswordValid) {
      return next(new AuthenticationError("Invalid email or password"));
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //generate token
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    //refresh token
    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    //store refresh token and access token in an httpOnly cookie
    setCookie(res, "seller_refreshToken", refreshToken);
    setCookie(res, "seller_accessToken", accessToken);

    res.status(200).json({
      success: true,
      message: "Seller logged in successfully",
      seller: { id: seller.id, name: seller.name, email: seller.email },
    });
  } catch (error) {
    return next(error);
  }
};

// get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};

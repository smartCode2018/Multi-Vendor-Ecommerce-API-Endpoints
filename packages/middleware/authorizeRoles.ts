import { NextFunction, Response } from "express";
import { AuthorizationError } from "../error-handler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new AuthorizationError("Access denied: Seller only"));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthorizationError("Access denied: User only"));
  }
  next();
};

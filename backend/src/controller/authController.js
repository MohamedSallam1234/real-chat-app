import catchAsync from "../utils/catchAsync.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import { promisify } from "util";

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    profilePic: req.body.profilePic,
  });

  SendToken(newUser, 201, res);
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
});

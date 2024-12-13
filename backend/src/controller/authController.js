import catchAsync from "../utils/catchAsync.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import { promisify } from "util";
import cloudinary from "../lib/cloudinary.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const SendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: "strict",
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

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
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  SendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in! Please log in.", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401,
      ),
    );
  }
  req.user = currentUser;
  next();
});

export const logout = catchAsync((req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    status: "success",
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const { profilePic } = req.body;
  const userId = req.user._id;
  if (!profilePic) {
    return next(new AppError("Please provide a profile picture", 400));
  }
  const upload = await cloudinary.uploader.upload(profilePic);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: upload.secure_url },
    { new: true },
  );
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const checkAuth = catchAsync((req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

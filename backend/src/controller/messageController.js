import catchAsync from "../utils/catchAsync.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import appError from "../utils/appError.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSideBar = catchAsync(async (req, res, next) => {
  const loggedInUser = req.user._id;
  const users = await User.find({ _id: { $ne: loggedInUser } });

  if (!users) {
    return next(new appError("No users found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

export const getMessages = catchAsync(async (req, res, next) => {
  const user = req.params.id;
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: user },
      { sender: user, receiver: req.user._id },
    ],
  });

  if (!messages) {
    return next(new appError("No messages found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      messages,
    },
  });
});

export const sendMessage = catchAsync(async (req, res, next) => {
  const receiver = req.params.id;
  const sender = req.user._id;
  const { text, image } = req.body;

  if (!text && !image) {
    return next(new appError("Please provide text or image", 400));
  }

  let imageUrl;
  if (image) {
    const result = await cloudinary.uploader.upload(image);
    imageUrl = result.secure_url;
  }

  const message = await Message.create({
    sender,
    receiver,
    text,
    image: imageUrl,
  });

  res.status(201).json({
    status: "success",
    data: {
      message,
    },
  });
});

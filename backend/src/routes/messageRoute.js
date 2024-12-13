import express from "express";
import { protect } from "../controller/authController.js";
import {
  getMessages,
  getUsersForSideBar,
  sendMessage,
} from "../controller/messageController.js";

const router = express.Router();

router.get("/users", protect, getUsersForSideBar);
router.get("/:id", protect, getMessages);

router.post("send/:id", protect, sendMessage);

export default router;

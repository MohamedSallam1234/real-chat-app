import express from "express";
import {
  login,
  logout,
  protect,
  signup,
  updateProfile,
} from "../controller/authController.js";

const router = express.Router();

router.post("/signup", signup);

export default router;

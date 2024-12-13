import express from "express";
import {
  checkAuth,
  login,
  logout,
  protect,
  signup,
  updateProfile,
} from "../controller/authController.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", protect, logout);

router.put("/update-profile", protect, updateProfile);

router.get("/check", protect, checkAuth);

export default router;

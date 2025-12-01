import express from "express";
import { getDashboardInfo } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// GET /api/dashboard (current user)
router.get("/", verifyToken, getDashboardInfo);
// GET /api/dashboard/:userId (by userId, for admin/future use)
router.get("/:userId", verifyToken, getDashboardInfo);

export default router;

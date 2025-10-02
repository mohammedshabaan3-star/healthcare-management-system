import express from "express";
import { authenticateSession, authorizeRole } from "../middleware/auth.js";
import {
  getProtocols,
  createProtocol,
  updateProtocol,
  deleteProtocol,
  toggleProtocolStatus
} from "../controllers/protocolController.js";

const router = express.Router();

// ✅ نفس النمط زي الخدمات
router.get("/", authenticateSession, getProtocols);
router.post("/", authenticateSession, authorizeRole("system_admin"), createProtocol);
router.put("/:id", authenticateSession, authorizeRole("system_admin"), updateProtocol);
router.delete("/:id", authenticateSession, authorizeRole("system_admin"), deleteProtocol);
router.patch("/:id/toggle-status", authenticateSession, authorizeRole("system_admin"), toggleProtocolStatus);

export default router;

import express from "express";
import {
  enableNotifications,
  disableNotifications,
  getNotificationStatus
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/enable", enableNotifications);
router.post("/disable", disableNotifications);
router.get("/status/:studentId", getNotificationStatus);

export default router;

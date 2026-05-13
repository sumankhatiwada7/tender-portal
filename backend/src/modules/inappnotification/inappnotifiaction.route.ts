import { Router } from "express";
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from "./inappnotification.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();



router.get("/",authMiddleware,getMyNotifications);
router.patch("/read-all",authMiddleware,markAllAsRead);
router.patch("/:notificationid/read",authMiddleware,markAsRead);
router.delete("/:notificationid",authMiddleware,deleteNotification);

export default router;
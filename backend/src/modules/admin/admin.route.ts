import express from 'express';
import { authMiddleware, authorizeRoles } from '../auth/auth.middleware';
import { roles } from '../auth/authtype';
import { createuser, getallusers,getPendingUsers,approvedUser,rejectUser } from './admin.controller';


const router = express.Router();

router.get("/pending-users", authMiddleware, authorizeRoles(roles.admin), getPendingUsers);
router.get("/all-users", authMiddleware, authorizeRoles(roles.admin), getallusers);
router.post("/create-user", authMiddleware, authorizeRoles(roles.admin), createuser);
router.post("/approve-user/:id", authMiddleware, authorizeRoles(roles.admin), approvedUser);
router.post("/reject-user/:id", authMiddleware, authorizeRoles(roles.admin), rejectUser);

// Contract-aligned routes
router.get("/users/pending", authMiddleware, authorizeRoles(roles.admin), getPendingUsers);
router.patch("/users/:id/approve", authMiddleware, authorizeRoles(roles.admin), approvedUser);
router.patch("/users/:id/reject", authMiddleware, authorizeRoles(roles.admin), rejectUser);

export default router;
import express from 'express';
import { authMiddleware, authorizeRoles } from '../auth/auth.middleware';
import { createBid,getBidsForTender,getBidsbyidfortender } from './bid.controller';
import { roles } from "../../core/types/authtype";

const router = express.Router();



router.post('/create/:tenderid', authMiddleware, authorizeRoles([roles.business]), createBid);
router.get('/tender/:tenderid', authMiddleware, authorizeRoles([roles.government]), getBidsForTender);
router.get('/tender/:tenderid/:bidid', authMiddleware, authorizeRoles([roles.government]), getBidsbyidfortender);

export default router;



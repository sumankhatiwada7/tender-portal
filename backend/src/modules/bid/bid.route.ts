import express from 'express';
import { authMiddleware, authorizeRoles } from '../auth/auth.middleware';
import { createBid,getBidsForTender,getBidsbyidfortender,acceptbid,rejectbid } from './bid.controller';
import { roles } from "../auth/authtype";
import { uploadDocument, handleUploadError } from '../../core/upload/upload.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/bid/create/{tenderid}:
 *   post:
 *     summary: Create a bid for a tender
 *     tags:
 *       - Bid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenderid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBidRequest'
 *     responses:
 *       201:
 *         description: Bid created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BidResponse'
 *       400:
 *         description: Validation failed or duplicate bid
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

router.post(
	'/create/:tenderid',
	authMiddleware,
	authorizeRoles(roles.business),
	(req, res, next) => {
		uploadDocument.array("documents", 3)(req, res, (error) => {
			if (error) {
				return handleUploadError(error, res);
			}

			next();
		});
	},
	createBid
);
/**
 * @swagger
 * /api/v1/bid/tender/{tenderid}:
 *   get:
 *     summary: Get all bids for a tender
 *     tags:
 *       - Bid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenderid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bids retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BidListResponse'
 *       404:
 *         description: No bids found for this tender
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/tender/:tenderid', authMiddleware, authorizeRoles(roles.government), getBidsForTender);
/**
 * @swagger
 * /api/v1/bid/tender/{tenderid}/{bidid}:
 *   get:
 *     summary: Get one bid for a tender
 *     tags:
 *       - Bid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenderid
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bidid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bid retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BidResponse'
 *       404:
 *         description: Bid not found for this tender
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/tender/:tenderid/:bidid', authMiddleware, authorizeRoles(roles.government), getBidsbyidfortender);

router.post('/accept/:tenderid/:bidid', authMiddleware, authorizeRoles(roles.government), acceptbid);

router.post('/reject/:tenderid/:bidid', authMiddleware, authorizeRoles(roles.government), rejectbid);




export default router;



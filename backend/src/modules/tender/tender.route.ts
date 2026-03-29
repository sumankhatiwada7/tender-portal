import express from "express";
import { authMiddleware, authorizeRoles } from "../auth/auth.middleware";
import { CreateTender,GetTenderById, GetAllTenders, DeleteTender, UpdateTender } from "./tender.controller";
import  { roles } from "../../core/types/authtype";
const router= express.Router();

/**
 * @swagger
 * /api/v1/tender/create:
 *   post:
 *     summary: Create a tender
 *     tags:
 *       - Tender
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - deadline
 *               - budget
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tender created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post("/create", authMiddleware, authorizeRoles([roles.government]), CreateTender);

/**
 * @swagger
 * /api/v1/tender/{id}:
 *   get:
 *     summary: Get a tender by id
 *     tags:
 *       - Tender
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tender found successfully
 *       404:
 *         description: Tender not found
 */
router.get("/:id", authMiddleware, GetTenderById);

/**
 * @swagger
 * /api/v1/tender:
 *   get:
 *     summary: Get all tenders
 *     tags:
 *       - Tender
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenders found successfully
 *       404:
 *         description: No tenders found
 */
router.get("/", authMiddleware, GetAllTenders);

/**
 * @swagger
 * /api/v1/tender/update/{id}:
 *   put:
 *     summary: Update a tender
 *     tags:
 *       - Tender
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               budget:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *     responses:
 *       200:
 *         description: Tender updated successfully
 *       404:
 *         description: Tender not found
 */
router.put("/update/:id", authMiddleware, authorizeRoles([roles.government]), UpdateTender);

/**
 * @swagger
 * /api/v1/tender/delete/{id}:
 *   post:
 *     summary: Delete a tender
 *     tags:
 *       - Tender
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tender deleted successfully
 *       404:
 *         description: Tender not found
 */
router.post("/delete/:id", authMiddleware, authorizeRoles([roles.government]), DeleteTender);

export default router;

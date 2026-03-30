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
 *             $ref: '#/components/schemas/CreateTenderRequest'
 *     responses:
 *       201:
 *         description: Tender created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenderResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenderResponse'
 *       404:
 *         description: Tender not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenderListResponse'
 *       404:
 *         description: No tenders found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *             $ref: '#/components/schemas/UpdateTenderRequest'
 *     responses:
 *       200:
 *         description: Tender updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenderResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Tender not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Tender not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/delete/:id", authMiddleware, authorizeRoles([roles.government]), DeleteTender);

export default router;

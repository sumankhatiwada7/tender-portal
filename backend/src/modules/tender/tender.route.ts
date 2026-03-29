import express from "express";
import { authMiddleware, authorizeRoles } from "../auth/auth.middleware";
import { CreateTender,GetTenderById, GetAllTenders, DeleteTender, UpdateTender } from "./tender.controller";
import  { roles } from "../../core/types/authtype";
const router= express.Router();


router.post("/create", authMiddleware, authorizeRoles([roles.government]), CreateTender);
router.get("/:id", authMiddleware, GetTenderById);
router.get("/", authMiddleware, GetAllTenders);
router.put("/update/:id", authMiddleware, authorizeRoles([roles.government]), UpdateTender);
router.post("/delete/:id", authMiddleware, authorizeRoles([roles.government]), DeleteTender);
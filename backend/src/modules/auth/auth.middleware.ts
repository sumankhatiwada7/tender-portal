import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import { jwtpayload, authrequest, roles } from "./authtype";
import { apitype } from "../../core/types/apitype";

function getAccessSecret() {
    return process.env.jwtkey || process.env.JWT_SECRET;
}

export const authMiddleware = (req: authrequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const payload: apitype = {
                message: "Authorization header missing or invalid",
                sucess: false
            };
            return res.status(401).json(payload);
        }

        const token = authHeader.slice(7).trim();
        if (!token) {
            const payload: apitype = {
                message: "Token missing",
                sucess: false
            };
            return res.status(401).json(payload);
        }

        const jwtSecret = getAccessSecret();
        if (!jwtSecret) {
            const payload: apitype = {
                message: "JWT secret not configured",
                sucess: false
            };
            return res.status(500).json(payload);
        }

        const decoded = Jwt.verify(token, jwtSecret) as unknown as jwtpayload;
        req.user = decoded;
        next();

    } catch (error) {
        const message = error instanceof Jwt.TokenExpiredError
            ? "Access token expired"
            : "Invalid token";
        const payload: apitype = {
            message,
            sucess: false
        };
        return res.status(401).json(payload);
    }
};

export const authorizeRoles = (...allowedRoles: roles[]) => {
    return (req: authrequest, res: Response, next: NextFunction) => {
        try {
            const userRoles: roles[] = Array.isArray(req.user?.role)
                ? req.user.role
                : req.user?.role
                    ? [req.user.role]
                    : [];

            const hasRole = allowedRoles.some(role => userRoles.includes(role));  // ✅ check array
            if (!hasRole) {
                const payload: apitype = {
                    message: "Access denied: insufficient permissions",
                    sucess: false
                };
                return res.status(403).json(payload);
            }

            next();

        } catch (_error) {
            const payload: apitype = {
                message: "Authorization error",
                sucess: false
            };
            return res.status(403).json(payload);
        }
    };
};
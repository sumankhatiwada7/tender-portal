import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { apitype } from "../../core/types/apitype";
import type { errorstype } from "../../core/types/errorstype";
import type { userdocument, userlist, userresponse } from "../../core/types/usertype";
import { roles } from "./authtype";
import { User } from "../user/user.model";

type uploadedDocumentInput = {
    path?: string;
    secure_url?: string;
    originalname?: string;
};

type loginresponse = apitype & {
    token: string;
    user: userlist;
};

function tolistitem(user: userdocument): userlist {
    return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    };
}

function mapUploadedDocuments(files: uploadedDocumentInput[]) {
    return files
        .map((file) => {
            const url = String(file.path || file.secure_url || "").trim();
            const originalname = String(file.originalname || "").trim();

            if (!url || !originalname) {
                return null;
            }

            return {
                url,
                originalname,
                uploadedAt: new Date(),
            };
        })
        .filter((doc): doc is { url: string; originalname: string; uploadedAt: Date } => Boolean(doc));
}

export async function Register(req: any, res: any) {
    try {
        const data = req.body || {};
        const name = data.name;
        const email = data.email;
        const password = data.password;
        const role = typeof data.role === "string" ? data.role.trim().toLowerCase() : "";
        const files = (Array.isArray(req.files) ? req.files : []) as uploadedDocumentInput[];

        const errors: NonNullable<errorstype["errors"]> = [];

        if (!name) errors.push({ field: "name", message: "Name is required" });
        if (!email) errors.push({ field: "email", message: "Email is required" });
        if (!password) errors.push({ field: "password", message: "Password is required" });
        if (files.length === 0) errors.push({ field: "verificationDocs", message: "Verification documents are required" });
        if (data.role !== undefined && role !== "government" && role !== "business") {
            errors.push({ field: "role", message: "Role must be either government or business" });
        }

        if (role === "business") {
            if (!String(data.registrationNumber ?? "").trim()) {
                errors.push({ field: "registrationNumber", message: "Registration number is required" });
            }
            if (!String(data.panNumber ?? "").trim()) {
                errors.push({ field: "panNumber", message: "PAN/VAT number is required" });
            }
        }

        if (role === "government") {
            if (!String(data.officeAddress ?? "").trim()) {
                errors.push({ field: "officeAddress", message: "Office address is required" });
            }
            if (!String(data.representative ?? "").trim()) {
                errors.push({ field: "representative", message: "Representative is required" });
            }
        }

        if (errors.length > 0) {
            const payload: errorstype = {
                message: "Validation error",
                sucess: false,
                errors,
            };
            return res.status(400).json(payload);
        }

        const existinguser = await User.findOne({ email: String(email).trim() });
        if (existinguser) {
            const payload: errorstype = {
                message: "User already exists",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const hashedpassword = await bcrypt.hash(String(password), 10);
        const finalRole = role === "government" ? "government" : "business";
        const verificationDocs = mapUploadedDocuments(files);

        if (verificationDocs.length === 0) {
            const payload: apitype = {
                message: "No file uploaded",
                sucess: false,
            };
            return res.status(400).json(payload);
        }


        const usercreate = await User.create({
            name,
            email: String(email).trim(),
            password: hashedpassword,
            role: finalRole,
            verificationDocs,
            businessInfo: finalRole === "business" ? {
                registrationNumber: String(data.registrationNumber ?? "").trim(),
                panNumber: String(data.panNumber ?? "").trim(),
            } : {
                registrationNumber: "",
                panNumber: "",
            },
            governmentInfo: finalRole === "government" ? {
                officeAddress: String(data.officeAddress ?? "").trim(),
                representative: String(data.representative ?? "").trim(),
            } : {
                officeAddress: "",
                representative: "",
            },
        });

        const payload: userresponse = {
            message: "User created successfully",
            sucess: true,
            user: tolistitem(usercreate as unknown as userdocument)
        };
        return res.status(201).json(payload);
    } catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            const payload: errorstype = {
                message: "Validation error",
                sucess: false,
                errors: [{ message: error.message }],
            };
            return res.status(400).json(payload);
        }

        const payload: apitype = {
            message: "Internal server error",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}

export async function Login(req: any, res: any) {
    try {
        const data = req.body || {};
        const email = data.email;
        const password = data.password;
        const errors: NonNullable<errorstype["errors"]> = [];

        if (!email) errors.push({ field: "email", message: "Email is required" });
        if (!password) errors.push({ field: "password", message: "Password is required" });

        if (errors.length > 0) {
            const payload: errorstype = {
                message: "Validation error",
                sucess: false,
                errors,
            };
            return res.status(400).json(payload);
        }

        const existinguser = await User.findOne({ email: String(email).trim() });
        if (!existinguser) {
            const payload: errorstype = {
                message: "Invalid email or password",
                sucess: false,
            };
            return res.status(401).json(payload);
        }
        if (existinguser.status === "pending") {
            const payload: errorstype = {
                message: "Your account is still pending approval",
                sucess:false
            }
            return res.status(403).json(payload)
        }
        if (existinguser.status === "rejected") {
            const payload: errorstype = {
                message: "Your account has been rejected",
                sucess:false
            }
            return res.status(403).json(payload)
        }
        if (existinguser.status !== "approved") {
            const payload: errorstype = {
                message: "Your account is not approved",
                sucess:false
            }
            return res.status(403).json(payload)
        }

        const passwordMatch = await bcrypt.compare(String(password), existinguser.password);
        if (!passwordMatch) {
            const payload: errorstype = {
                message: "Invalid email or password",
                sucess: false,
            };
            return res.status(401).json(payload);
        }

        const jwtSecret = process.env.jwtkey;
        if (!jwtSecret) {
            const payload: apitype = {
                message: "JWT configuration missing",
                sucess: false,
            };
            return res.status(500).json(payload);
        }

    const tokendata = { id: String(existinguser._id), role: existinguser.role as roles };
    const token = jwt.sign(tokendata, jwtSecret, { expiresIn: "7d" })

    const payload: loginresponse = {
        message: "Login successful",
        sucess: true,
        token,
        user: tolistitem(existinguser as unknown as userdocument),
    };

    return res.status(200).json(payload);
} catch (_error) {
    const payload: apitype = {
        message: "Internal server error",
        sucess: false,
    };
    return res.status(500).json(payload);
}
}

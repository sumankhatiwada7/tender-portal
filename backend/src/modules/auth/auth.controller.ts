import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { apitype } from "../../core/types/apitype";
import type { errorstype } from "../../core/types/errorstype";
import type { userdocument, userlist, userresponse } from "../../core/types/usertype";
import { User } from "../user/user.model";

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
    };
}

export async function Register(req: any, res: any) {
    try {
        const data = req.body || {};
        const name = data.name;
        const email = data.email;
        const password = data.password;
        const role = data.role;

        const errors: NonNullable<errorstype["errors"]> = [];

        if (!name) errors.push({ field: "name", message: "Name is required" });
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
        if (existinguser) {
            const payload: errorstype = {
                message: "User already exists",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const hashedpassword = await bcrypt.hash(String(password), 10);
        const finalRole =   role === "government" || role === "business" ? role : "business";


        const usercreate = await User.create({
            name,
            email: String(email).trim(),
            password: hashedpassword,
            role: finalRole,
        });

        const payload: userresponse = {
            message: "User created successfully",
            sucess: true,
            user: tolistitem(usercreate as unknown as userdocument)
        };
        return res.status(201).json(payload);
    } catch (_error) {
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

        const passwordMatch = await bcrypt.compare(String(password), existinguser.password);
        if (!passwordMatch) {
            const payload: errorstype = {
                message: "Invalid email or password",
                sucess: false,
            };
            return res.status(401).json(payload);
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            const payload: apitype = {
                message: "JWT configuration missing",
                sucess: false,
            };
            return res.status(500).json(payload);
        }

    const tokendata = { userid: existinguser._id,userrole: existinguser.role };
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
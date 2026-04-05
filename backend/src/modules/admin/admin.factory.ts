import bcrypt from "bcryptjs";
import { User } from '../user/user.model';

export async function createAdminifnotexists() {
    try{
    const adminemail = process.env.ADMIN_EMAIL;
    const adminpassword =process.env.ADMIN_PASSWORD;
    const adminname=process.env.ADMIN_NAME;
    if(!adminemail || !adminpassword || !adminname){
        console.warn("Admin credentials are not fully set in environment variables. Skipping admin user creation.");
        return;
        }
    const normalizedEmail = String(adminemail).trim();
    const existingAdmin = await User.findOne({ email: normalizedEmail });
    if (existingAdmin) {
        // Keep seeded admin in a usable state even if older data was pending.
        const updates: Record<string, string> = {};

        if (existingAdmin.role !== "admin") {
            updates.role = "admin";
        }

        if (existingAdmin.status !== "approved") {
            updates.status = "approved";
        }

        if (Object.keys(updates).length > 0) {
            await User.updateOne({ _id: existingAdmin._id }, { $set: updates });
            console.log("Admin user updated successfully.");
        } else {
            console.log("Admin user already exists. Skipping creation.");
        }
        return;

    }
    const hashedpassword = await bcrypt.hash(String(adminpassword), 10);
    await User.create({
        name: adminname,
        email: normalizedEmail,
        password: hashedpassword,
        role: "admin",
        status:"approved"
    });

    console.log("Admin user created successfully.");
    
    }
    catch(error){
        console.log("Error creating admin user:", error)
    }

}
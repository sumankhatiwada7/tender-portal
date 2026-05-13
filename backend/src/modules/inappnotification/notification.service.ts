import { createNotificationInput } from "./inappnotificationtype";
import { Notification } from "./notifiaction.model";

export async function createNotification(input: createNotificationInput) {
    try {
        return await Notification.create({
            recipient: input.recipient,
            type: input.type,
            title: input.title,
            message: input.message,
            link: input.link || null,
            meta: input.meta || {},
        });
    } catch (error) {
        console.error("Failed to create notification:", error);
        return null;
    }
}

export async function createNotifications(inputs: createNotificationInput[]) {
    if (inputs.length === 0) {
        return [];
    }

    try {
        return await Notification.insertMany(
            inputs.map((input) => ({
                recipient: input.recipient,
                type: input.type,
                title: input.title,
                message: input.message,
                link: input.link || null,
                meta: input.meta || {},
            })),
            { ordered: false }
        );
    } catch (error) {
        console.error("Failed to create notifications:", error);
        return [];
    }
}

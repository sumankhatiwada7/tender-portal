import { Notification } from "./notifiaction.model";
import { apitype } from "../../core/types/apitype";
import Tender from "../tender/tender.model";
import { bid } from "../bid/bid.model";
import { createNotifications } from "./notification.service";

async function backfillMissingBidNotifications(userid: string) {
    const ownedTenders = await Tender.find({ createdBy: userid }).select("_id title").lean();
    if (ownedTenders.length === 0) {
        return;
    }

    const tenderTitleById = new Map(
        ownedTenders.map((tender: any) => [String(tender._id), String(tender.title)])
    );
    const tenderIds = ownedTenders.map((tender: any) => tender._id);
    const recentBids = await bid
        .find({ tenderId: { $in: tenderIds } })
        .populate("businessId", "name")
        .select("_id tenderId businessId")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    if (recentBids.length === 0) {
        return;
    }

    const bidIds = recentBids.map((item: any) => item._id);
    const existingNotifications = await Notification.find({
        recipient: userid,
        type: "new_bid",
        "meta.bidId": { $in: bidIds },
    }).select("meta.bidId").lean();
    const existingBidIds = new Set(
        existingNotifications.map((notification: any) => String(notification.meta?.bidId))
    );

    await createNotifications(
        recentBids
            .filter((item: any) => !existingBidIds.has(String(item._id)))
            .map((item: any) => {
                const tenderId = String(item.tenderId);
                const businessName =
                    item.businessId && typeof item.businessId === "object"
                        ? item.businessId.name
                        : "A business";

                return {
                    recipient: userid,
                    type: "new_bid",
                    title: "New bid received",
                    message: `${businessName} submitted a bid for ${tenderTitleById.get(tenderId) ?? "your tender"}.`,
                    link: `/government/bids?tender=${tenderId}`,
                    meta: {
                        tenderId,
                        bidId: String(item._id),
                        userId: String(item.businessId?._id ?? item.businessId),
                    },
                };
            })
    );
}

// get all notifications for logged in user
export async function getMyNotifications(req: any, res: any) {
    try {
        const userid = req.user.id;
        await backfillMissingBidNotifications(userid);
        const notifications = await Notification.find({ recipient: userid })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: userid,
            isRead: false,
        });

        return res.status(200).json({
            message: "Notifications retrieved successfully",
            sucess: true,
            notifications,
            unreadCount,
        });
    } catch (error) {
        const payload: apitype = { message: "Internal server error", sucess: false };
        return res.status(500).json(payload);
    }
}

// mark single notification as read
export async function markAsRead(req: any, res: any) {
    try {
        const notificationId = req.params.notificationid;
        const userid = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userid },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            const payload: apitype = { message: "Notification not found", sucess: false };
            return res.status(404).json(payload);
        }

        return res.status(200).json({
            message: "Notification marked as read",
            sucess: true,
            notification,
        });
    } catch (error) {
        const payload: apitype = { message: "Internal server error", sucess: false };
        return res.status(500).json(payload);
    }
}

// mark all notifications as read
export async function markAllAsRead(req: any, res: any) {
    try {
        const userid = req.user.id;
        await Notification.updateMany(
            { recipient: userid, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({
            message: "All notifications marked as read",
            sucess: true,
        });
    } catch (error) {
        const payload: apitype = { message: "Internal server error", sucess: false };
        return res.status(500).json(payload);
    }
}

// delete single notification
export async function deleteNotification(req: any, res: any) {
    try {
        const notificationId = req.params.notificationid;
        const userid = req.user.id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userid,
        });

        if (!notification) {
            const payload: apitype = { message: "Notification not found", sucess: false };
            return res.status(404).json(payload);
        }

        return res.status(200).json({
            message: "Notification deleted",
            sucess: true,
        });
    } catch (error) {
        const payload: apitype = { message: "Internal server error", sucess: false };
        return res.status(500).json(payload);
    }
}

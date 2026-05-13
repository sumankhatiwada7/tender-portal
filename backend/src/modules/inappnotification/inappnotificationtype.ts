export type NotificationType =
    | "new_bid"
    | "bid_accepted"
    | "bid_rejected"
    | "new_tender"
    | "account_approved"
    | "account_rejected";

export type createNotificationInput = {
    recipient: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    meta?: {
        tenderId?: string;
        bidId?: string;
        userId?: string;
    };

}

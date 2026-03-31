import { NotificationBase } from "./notification.base";

export class Notifier {
  private notifications: NotificationBase[];

  constructor(...notifications: NotificationBase[]) {
    this.notifications = notifications;
  }

  async send(): Promise<void> {
    await Promise.allSettled(
      this.notifications.map(n => n.send())
    );
  }
}
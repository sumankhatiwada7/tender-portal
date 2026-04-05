import nodemailer from 'nodemailer';

import { NotificationBase } from '../../core/notification/notification.base';

export class EmailNotification extends NotificationBase{
    private subject:string;
    
    constructor(recepient:string, message:string, subject:string){
        super(recepient, message);
        this.subject = subject;
        this.recepient = recepient;
    }
    async send():Promise<void>{
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from:`"Tender system" <${process.env.EMAIL_USER}>`,
            to:this.recepient,
            subject:this.subject,
            html:this.message
        });
    }
}
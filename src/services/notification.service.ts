import {EmailNotification} from '../models/email-notification.model';
const sgMail = require('@sendgrid/mail');

export class NotificationService {

    async sendMailNotification(notification: EmailNotification): Promise<boolean> {
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const message = {
                to: notification.to,
                from: process.env.SENDGRID_EMAIL_FROM,
                subject: notification.subject,
                text: notification.textBody,
                html: notification.htmlBody,
            };

            await sgMail.send(message).then((data: any) => {
                console.log(data);
                return true;
            }, function (error: any) {
                console.log(JSON.stringify(error));
                return false;
            });
            return true;
        }
        catch (err) {
            return false;
        }
    }
}

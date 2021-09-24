import nodemailer from 'nodemailer';
import config from '../config/config.json';

export const sendEmail = async ({ to, subject, html, from = config.emailFrom }, info?: boolean) => {
    const transporter = nodemailer.createTransport(config.smtpOptions);
    const res = await transporter.sendMail({ from, to, subject, html });
    if (info) return res;
}

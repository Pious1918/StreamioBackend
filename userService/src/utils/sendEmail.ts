import nodemailer, { Transporter } from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()


const transporter: Transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Specify the Gmail SMTP server
    port: 465, // Use port 587 for TLS or 465 for SSL
    secure: true, // Use `true` for port 465, false for other ports
    auth: {
        user: "nspious1999@gmail.com", // Your Gmail address
        pass: process.env.EMAIL_PASS as string // Your Gmail app-specific password or OAuth token
    }
});


interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }

export const sendEmail = async (mailOptions:MailOptions): Promise<void>=>{
    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ',info)
    } catch (error) {
        console.error("error sending email", error)
        throw error;
    }
}
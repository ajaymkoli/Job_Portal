import nodemailer from 'nodemailer';

// Creates a transporter using environment variables if present,
// otherwise uses Ethereal (test SMTP) for development.
export async function createTransporter() {
    // If explicit SMTP host provided, use it
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // If SMTP_USER and SMTP_PASS are provided and look like Gmail, use Gmail service
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use Gmail (recommended to use an App Password)
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback to Ethereal for testing (no real emails sent)
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

export async function sendMail({ to, subject, text, html }) {
    const transporter = await createTransporter();
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@easily.local';
    const info = await transporter.sendMail({ from, to, subject, text, html });
    // If using Ethereal, log preview URL
    if (nodemailer.getTestMessageUrl && info) {
        const url = nodemailer.getTestMessageUrl(info);
        if (url) console.log('Ethereal preview URL: %s', url);
    }
    return info;
}

export default { createTransporter, sendMail };

import { sendMail } from '../utils/mailer.js';

// Middleware to send confirmation email after an application is saved.
// Expects req.newApplicant and req.job to be set by previous middleware.
const sendApplicationConfirmation = async (req, res, next) => {
    try {
        const applicant = req.newApplicant;
        const job = req.job;
        if (!applicant || !job) return next();

        const to = applicant.email;
        const subject = `Your application for ${job.jobdesignation} at ${job.companyname} has been received`;

        // Try to resolve recruiter name if available
        let recruiterName = job.posterEmail || '';
        try {
            const rec = UserModel.getUserByEmail ? UserModel.getUserByEmail(job.posterEmail) : null;
            if (rec && rec.name) recruiterName = rec.name;
        } catch (e) {
            // ignore
        }

        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const jobUrl = `${baseUrl}/jobdetails/${job.id}`;

        const text = `Hi ${applicant.name},\n\nThank you for applying for the position of ${job.jobdesignation} at ${job.companyname}. We have received your application on ${applicant.appliedOn}.\n\nRecruiter: ${recruiterName} (${job.posterEmail})\nJob details: ${jobUrl}\n\nWhat happens next:\n- Your application will be reviewed by the recruiter.\n- If shortlisted, the recruiter will contact you via email or phone.\n\nIf you have questions, reply to this email or contact support at ${process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@easily.local'}.\n\nThanks,\nEasily Team`;

        const html = `
                        <div style="font-family: Arial, Helvetica, sans-serif; color:#111; line-height:1.4;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="background:#0d6efd; padding:20px; text-align:center; color:white;">
                                        <h1 style="margin:0; font-size:20px;">Application received — ${job.companyname}</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px; background:#f7f7f7;">
                                        <p>Hi <strong>${applicant.name}</strong>,</p>
                                        <p>Thank you for applying for the role of <strong>${job.jobdesignation}</strong> at <strong>${job.companyname}</strong>. We received your application on <strong>${applicant.appliedOn}</strong>.</p>

                                        <h3 style="margin-top:18px; margin-bottom:8px;">Application summary</h3>
                                        <ul>
                                            <li><strong>Position:</strong> ${job.jobdesignation}</li>
                                            <li><strong>Company:</strong> ${job.companyname}</li>
                                            <li><strong>Recruiter:</strong> ${recruiterName} ${job.posterEmail ? `(${job.posterEmail})` : ''}</li>
                                            <li><strong>Applied on:</strong> ${applicant.appliedOn}</li>
                                        </ul>

                                        <p style="margin-top:10px;">You can view the job details here: <a href="${jobUrl}" target="_blank">${job.jobdesignation} at ${job.companyname}</a></p>

                                        <h4 style="margin-top:18px;">What happens next?</h4>
                                        <ol>
                                            <li>The recruiter will review your application.</li>
                                            <li>If shortlisted, the recruiter will contact you with next steps.</li>
                                            <li>If you do not hear back within 2 weeks, feel free to follow up.</li>
                                        </ol>

                                        <p>If you have any questions, reply to this email or contact us at <a href="mailto:${process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@easily.local'}">${process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@easily.local'}</a>.</p>

                                        <p style="margin-top:24px;">Best regards,<br/><strong>Easily Team</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background:#f1f1f1; padding:12px; text-align:center; font-size:12px; color:#666;">
                                        <div>If you did not apply for this role, please ignore this email.</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    `;

        // Send mail but don't block the response on failure. Log result.
        const info = await sendMail({ to, subject, text, html }).catch(err => {
            console.error('Failed to send confirmation email', err);
            return null;
        });
        if (info && info.messageId) console.log('Confirmation email sent: %s', info.messageId);
    } catch (err) {
        console.error('Error in sendApplicationConfirmation middleware', err);
    }
    return next();
};

export default { sendApplicationConfirmation };

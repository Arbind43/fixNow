import nodemailer from 'nodemailer';

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    auth: {
      user: process.env.EMAIL_USERNAME || 'username',
      pass: process.env.EMAIL_PASSWORD || 'password',
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'FixNow Support <support@fixnow.ai>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: ... (can add HTML template later)
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

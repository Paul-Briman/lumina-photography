import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3B82F6;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3B82F6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
          }
          .note {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Lumina</div>
          </div>
          <div class="content">
            <h2 style="text-align: center;">Reset Your Password</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for your Lumina account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="note">
              <p style="margin: 0;"><strong>This link will expire in 1 hour</strong></p>
              <p style="margin: 10px 0 0; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            
            <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 6px; font-size: 14px;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Lumina. All rights reserved.</p>
            <p style="font-size: 12px;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Lumina Password',
      html,
    });
  }
}

export const emailService = new EmailService();
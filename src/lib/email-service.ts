// lib/email-service.ts
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailConfig {
  service: 'gmail' | 'outlook' | 'smtp';
  host?: string;
  port?: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_APP_PASSWORD || ''
      }
    };

    this.transporter = nodemailer.createTransport(this.config);

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const from = `"MediVault Health Wallet" <${this.config.auth.user}>`;
      
      const mailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Email sent to ${options.to}: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      console.error('❌ Email sending failed:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  // Specific email methods
  async sendOTP(to: string, otp: string, purpose: 'registration' | 'login' | 'password_reset'): Promise<boolean> {
    const subject = purpose === 'registration' 
      ? 'Verify Your MediVault Account'
      : purpose === 'login'
      ? 'Your Login OTP'
      : 'Reset Your Password';

    const html = this.generateOTPEmail(otp, purpose);
    
    const result = await this.sendEmail({
      to,
      subject,
      html
    });

    return result.success;
  }

  private generateOTPEmail(otp: string, purpose: string): string {
    const purposeText = purpose === 'registration' 
      ? 'account registration'
      : purpose === 'login'
      ? 'login'
      : 'password reset';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MediVault OTP Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .otp-box { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            border: 2px dashed #2563eb;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 10px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
          }
          .warning { 
            background: #fef3c7; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MediVault Health Wallet</h1>
          </div>
          <div class="content">
            <h2>OTP Verification</h2>
            <p>Hello,</p>
            <p>Your One-Time Password (OTP) for ${purposeText} is:</p>
            
            <div class="otp-box">${otp}</div>
            
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>• Never share this OTP with anyone</p>
              <p>• MediVault will never ask for your OTP</p>
              <p>• If you didn't request this, please ignore this email</p>
            </div>
            
            <p>Best regards,<br>The MediVault Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MediVault Health Wallet. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = 'Welcome to MediVault Health Wallet!';
    const html = this.generateWelcomeEmail(name);
    
    const result = await this.sendEmail({
      to,
      subject,
      html
    });

    return result.success;
  }

  private generateWelcomeEmail(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MediVault</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .features { margin: 20px 0; }
          .feature { 
            background: white; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border-left: 4px solid #2563eb;
          }
          .cta-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MediVault!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Welcome to MediVault Health Wallet! We're excited to have you on board.</p>
            
            <div class="features">
              <h3>What you can do with MediVault:</h3>
              
              <div class="feature">
                <strong>📊 Health Records Management</strong>
                <p>Upload and organize all your medical reports in one secure place</p>
              </div>
              
              <div class="feature">
                <strong>📈 Vitals Tracking</strong>
                <p>Monitor your health metrics over time with interactive charts</p>
              </div>
              
              <div class="feature">
                <strong>👥 Secure Sharing</strong>
                <p>Share specific reports with doctors, family, or caregivers</p>
              </div>
              
              <div class="feature">
                <strong>🔐 Privacy Control</strong>
                <p>Full control over who can access your health information</p>
              </div>
            </div>
            
            <p>Get started by completing your profile and uploading your first health report.</p>
            
            <a href="${process.env.APP_URL}" class="cta-button">Go to Dashboard</a>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Stay healthy!<br>The MediVault Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MediVault Health Wallet. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Singleton instance
export const emailService = new EmailService();
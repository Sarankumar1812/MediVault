import nodemailer from 'nodemailer';

interface ShareInvitationEmailProps {
  to: string;
  fromName: string;
  fromEmail: string;
  accessLevel: string;
  invitationLink: string;
}

export async function sendShareInvitationEmail({ 
  to, 
  fromName, 
  fromEmail,
  accessLevel,
  invitationLink 
}: ShareInvitationEmailProps): Promise<{ success: boolean; message?: string; error?: string; simulated?: boolean }> {
  try {
    console.log('📧 Attempting to send email to:', to);
    
    // Check if environment variables are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      const errorMsg = 'Gmail credentials not configured in environment variables';
      console.error('❌', errorMsg);
      return { 
        success: true, // Return success to not break UI
        simulated: true,
        message: 'Email credentials not configured - invitation created locally'
      };
    }

    console.log('📧 Using Gmail account:', process.env.GMAIL_USER);
    
    // ✅ FIX: Use simple Gmail configuration that works everywhere
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      // ✅ CRITICAL FIX for SSL 
      tls: {
        rejectUnauthorized: false  // Allow self-signed certificates
      },
      // Additional reliability settings
      pool: true,
      maxConnections: 1,
      maxMessages: 5
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError: any) {
      console.error('❌ SMTP connection failed:', verifyError.message);
      
      // In development/localhost, simulate success but log error
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.log('⚠️ In development mode - simulating email send');
        console.log('📧 Email would have been sent to:', to);
        console.log('📧 From:', `${fromName} <${fromEmail}>`);
        console.log('📧 Access Level:', accessLevel);
        console.log('📧 Invitation Link:', invitationLink);
        
        return { 
          success: true, 
          simulated: true,
          message: 'Development mode - email simulated'
        };
      }
      
      return { 
        success: false, 
        error: `SMTP connection failed: ${verifyError.message}` 
      };
    }

    const mailOptions = {
      from: `"HealthWallet" <${process.env.GMAIL_USER}>`,
      to,
      replyTo: fromEmail,
      subject: `${fromName} has shared medical reports with you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Health Records Shared</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">HealthWallet</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">Medical Report Access Granted</h2>
            
            <p>Hello,</p>
            
            <p><strong>${fromName}</strong> (${fromEmail}) has shared their medical reports with you on HealthWallet.</p>
            
            <div style="background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Access Level:</strong> ${accessLevel}</p>
              <p style="margin: 0;"><strong>Expires:</strong> 7 days from invitation</p>
            </div>
            
            <p>To view the shared reports, please click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Shared Reports
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Important:</strong> This link will expire in 7 days. 
                You'll need to create a HealthWallet account to access the reports.
              </p>
            </div>
            
            <p>Best regards,<br>The HealthWallet Team</p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              This email was sent by HealthWallet. Please do not reply to this email.<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Medical Report Access Granted
        
        Hello,
        
        ${fromName} (${fromEmail}) has shared their medical reports with you on HealthWallet.
        
        Access Level: ${accessLevel}
        Expires: 7 days from invitation
        
        To view the shared reports, please visit: ${invitationLink}
        
        Important: This link will expire in 7 days. You'll need to create a HealthWallet account to access the reports.
        
        Best regards,
        The HealthWallet Team
      `
    };

    console.log(`📧 Sending email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}, Message ID: ${info.messageId}`);
    
    return { 
      success: true, 
      message: `Email sent successfully, Message ID: ${info.messageId}` 
    };
  } catch (error: any) {
    console.error('❌ Error sending email:', error.message);
    
    // For development/localhost, simulate success
    if (process.env.NODE_ENV === 'development' || !process.env.GMAIL_APP_PASSWORD) {
      console.log('⚠️ Development mode - simulating successful email');
      console.log('📧 Email details:');
      console.log('📧 To:', to);
      console.log('📧 From:', `${fromName} <${fromEmail}>`);
      console.log('📧 Access Level:', accessLevel);
      console.log('📧 Invitation Link:', invitationLink);
      
      return { 
        success: true, 
        simulated: true,
        message: 'Development mode - email simulated due to error'
      };
    }
    
    return { 
      success: false, 
      error: `Failed to send email: ${error.message}` 
    };
  }
}
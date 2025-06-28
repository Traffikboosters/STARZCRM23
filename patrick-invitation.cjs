const nodemailer = require("nodemailer");
const crypto = require("crypto");

async function sendPatrickInvitation() {
  try {
    const email = "dnarcisse48@gmail.com";
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const invitationId = Date.now();
    
    console.log(`✓ Creating fresh invitation for Patrick Pluviose`);
    console.log(`✓ Email: ${email}`);
    console.log(`✓ Invitation ID: ${invitationId}`);
    console.log(`✓ Token: ${invitationToken}`);
    
    const invitationLink = `https://enterprise-scheduler-pro.replit.app/invite/${invitationToken}`;
    
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Platform Invitation - Traffik Boosters</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, hsl(14, 88%, 55%) 0%, hsl(29, 85%, 58%) 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <div style="background: white; padding: 20px; border-radius: 10px; display: inline-block;">
          <h1 style="color: hsl(14, 88%, 55%); font-size: 28px; margin: 0;">TRAFFIK BOOSTERS</h1>
        </div>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: hsl(14, 88%, 55%); margin-bottom: 20px;">Welcome to Traffik Boosters Platform!</h2>
        
        <p><strong>Patrick Pluviose</strong>, you've been invited to join our business management platform.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Personal Email:</strong> ${email}</p>
          <p><strong>Role:</strong> Sales Representative</p>
          <p><strong>Work Email:</strong> patrick.pluviose@traffikboosters.com</p>
          <p><strong>Commission Rate:</strong> 10%</p>
          <p><strong>Invitation ID:</strong> ${invitationId}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" style="background: hsl(14, 88%, 55%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Accept Invitation & Create Account
          </a>
        </div>
        
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: hsl(14, 88%, 55%);">Platform Access Information:</h4>
          <p style="margin-bottom: 5px;"><strong>Platform URL:</strong> https://enterprise-scheduler-pro.replit.app</p>
          <p style="margin-bottom: 5px;"><strong>Invitation Token:</strong> ${invitationToken}</p>
          <p style="margin-bottom: 0;"><strong>Expires:</strong> 10 days from today</p>
        </div>
        
        <p style="font-size: 14px; color: #666;">Click the invitation link above to set up your account and access the platform. This invitation expires in 10 days.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="margin-bottom: 10px; font-weight: bold; color: hsl(14, 88%, 55%); font-size: 18px;">More Traffik! More Sales!</p>
          <p style="font-size: 12px; color: #666;">
            Traffik Boosters<br>
            Phone: (877) 840-6250<br>
            Email: info@traffikboosters.com
          </p>
        </div>
      </div>
    </body>
    </html>`;

    const emailTransporter = nodemailer.createTransport({
      host: "smtp.ipage.com",
      port: 465,
      secure: true,
      auth: {
        user: "starz@traffikboosters.com",
        pass: "Tr@ff1kB00st3rs2024!"
      }
    });

    console.log(`✓ Sending invitation email to ${email}...`);
    
    const emailResult = await emailTransporter.sendMail({
      from: '"Traffik Boosters Platform" <starz@traffikboosters.com>',
      to: email,
      subject: "Platform Invitation - Patrick Pluviose - Traffik Boosters",
      html: emailHtml
    });

    console.log(`✓ Email sent successfully!`);
    console.log(`✓ SMTP Response: ${emailResult.response}`);
    console.log(`✓ Message ID: ${emailResult.messageId}`);
    
    return {
      success: true,
      invitationId,
      token: invitationToken,
      email,
      smtpResponse: emailResult.response,
      messageId: emailResult.messageId
    };

  } catch (error) {
    console.error('✗ Invitation failed:', error.message);
    throw error;
  }
}

// Run the invitation
sendPatrickInvitation()
  .then(result => {
    console.log(`\n✓ SUCCESS: Patrick Pluviose invitation sent successfully`);
    console.log(`✓ Check email: ${result.email}`);
    console.log(`✓ Invitation ID: ${result.invitationId}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`\n✗ FAILED: ${error.message}`);
    process.exit(1);
  });
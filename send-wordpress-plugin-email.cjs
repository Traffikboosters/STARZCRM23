// WordPress Plugin Email Delivery Script
// This script sends the WordPress plugin package via your hosting account email

const nodemailer = require('nodemailer');
const fs = require('fs');

// Email configuration for your hosting account
const emailConfig = {
  host: 'smtp.ipage.com',
  port: 465,
  secure: true,
  auth: {
    user: 'starz@traffikboosters.com',
    pass: 'StarzCRM2025!' // Your hosting email password
  }
};

async function sendWordPressPlugin() {
  try {
    console.log('📧 Preparing to send WordPress plugin package...');
    
    // Create transporter using hosting account
    const transporter = nodemailer.createTransporter(emailConfig);
    
    // Verify SMTP connection
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Read plugin file and instructions
    const pluginContent = fs.readFileSync('starz-chat-widget.php', 'utf8');
    const instructionsContent = fs.readFileSync('STARZ-Chat-Widget-Installation-Guide.md', 'utf8');
    
    console.log('📄 Plugin file size:', (pluginContent.length / 1024).toFixed(1), 'KB');
    console.log('📄 Instructions size:', (instructionsContent.length / 1024).toFixed(1), 'KB');
    
    // Email content
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>STARZ Chat Widget - WordPress Plugin Package</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
            }
            .header { 
                background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 10px 10px 0 0; 
            }
            .logo { 
                font-size: 32px; 
                font-weight: bold; 
                margin-bottom: 10px; 
            }
            .slogan { 
                font-size: 18px; 
                opacity: 0.9; 
            }
            .content { 
                background: #fff; 
                padding: 30px; 
                border: 1px solid #e0e0e0; 
            }
            .feature-box { 
                background: #f8f9fa; 
                border-left: 4px solid #ea580c; 
                padding: 20px; 
                margin: 20px 0; 
            }
            .installation-steps { 
                background: #e8f5e8; 
                border: 1px solid #4caf50; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
            }
            .step { 
                display: flex; 
                align-items: center; 
                margin: 10px 0; 
            }
            .step-number { 
                background: #ea580c; 
                color: white; 
                width: 30px; 
                height: 30px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-right: 15px; 
                font-weight: bold; 
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                border-radius: 0 0 10px 10px; 
                font-size: 14px; 
                color: #666; 
            }
            .highlight { 
                color: #ea580c; 
                font-weight: bold; 
            }
            .download-section {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .code-block {
                background: #f4f4f4;
                border: 1px solid #ddd;
                padding: 15px;
                border-radius: 5px;
                font-family: monospace;
                margin: 10px 0;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">TRAFFIK BOOSTERS</div>
            <div class="slogan">More Traffik! More Sales!</div>
            <h1 style="margin: 20px 0 0 0;">WordPress Plugin Package</h1>
        </div>

        <div class="content">
            <h2>🚀 Your STARZ Chat Widget is Ready!</h2>
            
            <p>Hello! Your custom WordPress plugin package is attached to this email. This professional chat widget will capture leads directly from your website and integrate seamlessly with your STARZ CRM system.</p>

            <div class="feature-box">
                <h3>✨ What's Included:</h3>
                <ul>
                    <li><strong>starz-chat-widget.php</strong> - Complete WordPress plugin (22KB)</li>
                    <li><strong>Installation Guide</strong> - Step-by-step setup instructions (15KB)</li>
                    <li><strong>Admin Settings Panel</strong> - Easy configuration interface</li>
                    <li><strong>Auto-Reply System</strong> - Professional email responses</li>
                    <li><strong>CRM Integration</strong> - Direct connection to your STARZ system</li>
                </ul>
            </div>

            <div class="installation-steps">
                <h3>🔧 Quick Installation Steps:</h3>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div>Download the attached <code>starz-chat-widget.php</code> file</div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div>Compress it into a ZIP file named <code>starz-chat-widget.zip</code></div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div>Go to WordPress Admin → Plugins → Add New → Upload Plugin</div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div>Upload the ZIP file and activate the plugin</div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div>Configure settings at Settings → STARZ Chat Widget</div>
                </div>
            </div>

            <div class="download-section">
                <h3>📥 Important Configuration</h3>
                <p>After installation, update the <span class="highlight">CRM API URL</span> setting to connect with your STARZ system:</p>
                <div class="code-block">
                https://your-starz-instance.replit.app/api/chat-widget-submit
                </div>
                <p><em>Replace "your-starz-instance" with your actual Replit project URL</em></p>
            </div>

            <h3>🎯 Key Features:</h3>
            <ul>
                <li><strong>Real-Time Lead Capture</strong> - Visitors contact you instantly</li>
                <li><strong>Business Hours Detection</strong> - Shows online/offline status</li>
                <li><strong>Mobile Responsive</strong> - Works perfectly on all devices</li>
                <li><strong>Professional Branding</strong> - Traffik Boosters colors and messaging</li>
                <li><strong>Automatic Email Responses</strong> - Instant confirmation emails</li>
                <li><strong>CRM Integration</strong> - All leads go directly to STARZ</li>
            </ul>

            <h3>📞 Support & Next Steps:</h3>
            <p>If you need any assistance with installation or configuration:</p>
            <ul>
                <li><strong>Email:</strong> <a href="mailto:starz@traffikboosters.com">starz@traffikboosters.com</a></li>
                <li><strong>Phone:</strong> <span class="highlight">(877) 840-6250</span></li>
            </ul>

            <p>Once installed, your website visitors will be able to contact you through the professional chat bubble, and all inquiries will automatically appear in your STARZ CRM system.</p>

            <div class="feature-box">
                <h4>🎉 Ready to boost your website conversions?</h4>
                <p>This chat widget will help you capture more leads and convert more visitors into customers. Remember: <span class="highlight">More Traffik! More Sales!</span></p>
            </div>
        </div>

        <div class="footer">
            <p><strong>STARZ Platform</strong> - Enterprise Business Management System</p>
            <p>© 2025 Traffik Boosters. All rights reserved.</p>
            <p>This email contains your custom WordPress plugin package.</p>
        </div>
    </body>
    </html>
    `;

    // Email options
    const mailOptions = {
      from: '"STARZ Platform" <starz@traffikboosters.com>',
      to: 'traffikboosters@gmail.com',
      subject: '🚀 Your WordPress Plugin Package is Ready - STARZ Chat Widget',
      html: emailHTML,
      attachments: [
        {
          filename: 'starz-chat-widget.php',
          content: pluginContent,
          contentType: 'text/plain'
        },
        {
          filename: 'STARZ-Chat-Widget-Installation-Guide.md',
          content: instructionsContent,
          contentType: 'text/markdown'
        }
      ]
    };

    // Send email
    console.log('📤 Sending email with WordPress plugin package...');
    console.log('📧 To: traffikboosters@gmail.com');
    console.log('📎 Attachments: starz-chat-widget.php, Installation-Guide.md');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Response: ${info.response}`);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('💡 Authentication failed. Check email credentials.');
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Connection failed. Check SMTP settings.');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Main execution
console.log('🚀 STARZ WordPress Plugin Email Delivery');
console.log('📧 Sending to: traffikboosters@gmail.com');
console.log('📎 Including: WordPress plugin files and installation guide');
console.log('');

sendWordPressPlugin()
  .then(result => {
    if (result.success) {
      console.log('');
      console.log('🎉 Plugin package delivered successfully!');
      console.log('📱 Check your email at traffikboosters@gmail.com');
      console.log('🔧 Follow the installation guide to set up the chat widget');
    } else {
      console.log('');
      console.log('❌ Email delivery failed');
      console.log('💡 Files are available locally for manual download:');
      console.log('   - starz-chat-widget.php');
      console.log('   - STARZ-Chat-Widget-Installation-Guide.md');
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
  });
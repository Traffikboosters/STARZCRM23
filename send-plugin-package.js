import { createTransporter } from './server/email-service.js';
import fs from 'fs';

async function sendWordPressPluginPackage() {
  try {
    console.log('📧 Preparing WordPress plugin package for delivery...');
    
    // Read plugin files
    const pluginContent = fs.readFileSync('starz-chat-widget.php', 'utf8');
    const instructionsContent = fs.readFileSync('STARZ-Chat-Widget-Installation-Guide.md', 'utf8');
    
    console.log('📄 Plugin file size:', (pluginContent.length / 1024).toFixed(1), 'KB');
    console.log('📄 Instructions size:', (instructionsContent.length / 1024).toFixed(1), 'KB');
    
    // Email HTML content
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
                padding: 40px; 
                text-align: center; 
                border-radius: 12px 12px 0 0; 
            }
            .logo { 
                font-size: 36px; 
                font-weight: bold; 
                margin-bottom: 15px; 
                letter-spacing: 2px;
            }
            .slogan { 
                font-size: 20px; 
                opacity: 0.95; 
                margin-bottom: 20px;
            }
            .content { 
                background: #fff; 
                padding: 40px; 
                border: 1px solid #e0e0e0; 
                border-top: none;
            }
            .feature-box { 
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                border-left: 5px solid #ea580c; 
                padding: 25px; 
                margin: 25px 0; 
                border-radius: 0 8px 8px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .installation-steps { 
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border: 2px solid #4caf50; 
                padding: 25px; 
                border-radius: 12px; 
                margin: 25px 0; 
            }
            .step { 
                display: flex; 
                align-items: center; 
                margin: 15px 0; 
                padding: 10px;
                background: rgba(255,255,255,0.7);
                border-radius: 8px;
            }
            .step-number { 
                background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
                color: white; 
                width: 35px; 
                height: 35px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-right: 20px; 
                font-weight: bold; 
                font-size: 16px;
                box-shadow: 0 2px 6px rgba(234, 88, 12, 0.3);
            }
            .footer { 
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 30px; 
                text-align: center; 
                border-radius: 0 0 12px 12px; 
                font-size: 14px; 
                color: #666; 
                border: 1px solid #e0e0e0;
                border-top: none;
            }
            .highlight { 
                color: #ea580c; 
                font-weight: bold; 
            }
            .download-section {
                background: linear-gradient(135deg, #fff3cd 0%, #fef7e0 100%);
                border: 2px solid #ffc107;
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                text-align: center;
            }
            .code-block {
                background: #2d3748;
                color: #e2e8f0;
                border: 1px solid #4a5568;
                padding: 20px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                margin: 15px 0;
                overflow-x: auto;
                font-size: 14px;
                line-height: 1.4;
            }
            .success-badge {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                margin: 10px 5px;
            }
            .feature-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .feature-item {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #ea580c;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">TRAFFIK BOOSTERS</div>
            <div class="slogan">More Traffik! More Sales!</div>
            <h1 style="margin: 0; font-size: 28px;">WordPress Plugin Package</h1>
            <div style="margin-top: 15px;">
                <span class="success-badge">✓ Complete Package</span>
                <span class="success-badge">✓ Ready to Install</span>
                <span class="success-badge">✓ CRM Integration</span>
            </div>
        </div>

        <div class="content">
            <h2 style="color: #ea580c; font-size: 24px;">🚀 Your STARZ Chat Widget is Ready!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">Your custom WordPress plugin package is attached to this email. This professional chat widget will capture leads directly from your website and integrate seamlessly with your STARZ CRM system.</p>

            <div class="feature-box">
                <h3 style="color: #ea580c; margin-top: 0;">✨ Complete Package Includes:</h3>
                <div class="feature-list">
                    <div class="feature-item">
                        <strong>🔧 Main Plugin File</strong><br>
                        starz-chat-widget.php (22KB)<br>
                        <em>Complete WordPress plugin with all functionality</em>
                    </div>
                    <div class="feature-item">
                        <strong>📋 Installation Guide</strong><br>
                        Detailed setup instructions (15KB)<br>
                        <em>Step-by-step walkthrough with screenshots</em>
                    </div>
                    <div class="feature-item">
                        <strong>⚙️ Admin Panel</strong><br>
                        Settings configuration interface<br>
                        <em>Easy customization through WordPress admin</em>
                    </div>
                    <div class="feature-item">
                        <strong>📧 Auto-Reply System</strong><br>
                        Professional email responses<br>
                        <em>Instant confirmation emails to visitors</em>
                    </div>
                </div>
            </div>

            <div class="installation-steps">
                <h3 style="color: #2d5016; margin-top: 0; text-align: center;">🔧 5-Minute Installation Process</h3>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div><strong>Download</strong> the attached <code>starz-chat-widget.php</code> file to your computer</div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div><strong>Create ZIP</strong> - Compress the PHP file into <code>starz-chat-widget.zip</code></div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div><strong>Upload</strong> - Go to WordPress Admin → Plugins → Add New → Upload Plugin</div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div><strong>Activate</strong> - Install the ZIP file and click "Activate Plugin"</div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div><strong>Configure</strong> - Set up at Settings → STARZ Chat Widget</div>
                </div>
            </div>

            <div class="download-section">
                <h3 style="color: #856404; margin-top: 0;">📥 Critical Configuration Step</h3>
                <p style="margin-bottom: 15px;">After installation, update the <span class="highlight">CRM API URL</span> to connect with your STARZ system:</p>
                <div class="code-block">
                https://your-starz-instance.replit.app/api/chat-widget-submit
                </div>
                <p style="margin-top: 15px;"><em>💡 Replace "your-starz-instance" with your actual Replit project URL</em></p>
            </div>

            <h3 style="color: #ea580c;">🎯 Professional Features:</h3>
            <div class="feature-list">
                <div class="feature-item">
                    <strong>⚡ Real-Time Lead Capture</strong><br>
                    Visitors contact you instantly through professional chat interface
                </div>
                <div class="feature-item">
                    <strong>🕐 Business Hours Detection</strong><br>
                    Automatically shows online/offline status with smart messaging
                </div>
                <div class="feature-item">
                    <strong>📱 Mobile Responsive</strong><br>
                    Perfect functionality across all devices and screen sizes
                </div>
                <div class="feature-item">
                    <strong>🎨 Professional Branding</strong><br>
                    Traffik Boosters colors, logo, and "More Traffik! More Sales!" messaging
                </div>
                <div class="feature-item">
                    <strong>📧 Auto-Reply System</strong><br>
                    Instant professional confirmation emails to all inquiries
                </div>
                <div class="feature-item">
                    <strong>🔗 CRM Integration</strong><br>
                    All leads automatically sync to your STARZ management system
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #ea580c;">📞 Professional Support Available</h3>
                <p style="font-size: 16px;">Need assistance with installation or configuration?</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:starz@traffikboosters.com" style="color: #ea580c;">starz@traffikboosters.com</a></p>
                    <p style="margin: 5px 0;"><strong>📞 Phone:</strong> <span class="highlight">(877) 840-6250</span></p>
                    <p style="margin: 5px 0;"><strong>⏰ Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</p>
                </div>
            </div>

            <p style="font-size: 16px; margin: 25px 0;">Once installed, your website visitors will contact you through the professional chat bubble, and all inquiries will automatically appear in your STARZ CRM system with complete lead details.</p>

            <div class="feature-box" style="text-align: center;">
                <h4 style="color: #ea580c; margin-top: 0; font-size: 20px;">🎉 Ready to Boost Your Website Conversions?</h4>
                <p style="font-size: 16px; margin-bottom: 15px;">This professional chat widget will help you capture more leads and convert more visitors into paying customers.</p>
                <p style="font-size: 18px; font-weight: bold; color: #ea580c; margin: 0;">More Traffik! More Sales! 🚀</p>
            </div>
        </div>

        <div class="footer">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">STARZ Platform - Enterprise Business Management System</p>
            <p style="margin: 5px 0;">© 2025 Traffik Boosters. All rights reserved.</p>
            <p style="margin: 5px 0;">This email contains your custom WordPress plugin package with complete installation instructions.</p>
            <p style="margin: 15px 0 5px 0; color: #ea580c; font-weight: bold;">📎 Files Attached: starz-chat-widget.php • Installation-Guide.md</p>
        </div>
    </body>
    </html>
    `;

    // Create email using STARZ email service
    const transporter = createTransporter();
    
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

    console.log('📤 Sending WordPress plugin package...');
    console.log('📧 To: traffikboosters@gmail.com');
    console.log('📎 Attachments: starz-chat-widget.php, Installation-Guide.md');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ WordPress plugin package sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Response: ${info.response}`);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('❌ Error sending WordPress plugin package:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the email delivery
sendWordPressPluginPackage()
  .then(result => {
    if (result.success) {
      console.log('');
      console.log('🎉 WordPress plugin package delivered successfully!');
      console.log('📱 Check your email at traffikboosters@gmail.com');
      console.log('🔧 Follow the installation guide to set up the chat widget on your WordPress site');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Download the attached starz-chat-widget.php file');
      console.log('2. Create a ZIP file for WordPress installation');
      console.log('3. Upload to WordPress Admin → Plugins → Add New');
      console.log('4. Configure the CRM API URL in plugin settings');
      console.log('5. Test the chat widget on your website');
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

export default sendWordPressPluginPackage;
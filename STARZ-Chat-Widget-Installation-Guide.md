# STARZ Chat Widget - WordPress Installation Guide

## Complete WordPress Plugin Package for Traffik Boosters

This professional chat widget integrates seamlessly with your STARZ CRM system to capture leads directly from your WordPress website.

## 📦 Package Contents

- `starz-chat-widget.php` - Main plugin file
- `STARZ-Chat-Widget-Installation-Guide.md` - This installation guide

## 🚀 Installation Instructions

### Step 1: Download and Prepare
1. Save the `starz-chat-widget.php` file to your computer
2. Compress it into a ZIP file named `starz-chat-widget.zip`

### Step 2: Upload to WordPress
1. Log into your WordPress admin dashboard
2. Navigate to **Plugins → Add New**
3. Click **Upload Plugin**
4. Choose the `starz-chat-widget.zip` file
5. Click **Install Now**
6. Click **Activate Plugin**

### Step 3: Configure Settings
1. Go to **Settings → STARZ Chat Widget**
2. Configure the following options:
   - **Enable Chat Widget**: ✅ Checked
   - **Widget Position**: Bottom Right (recommended)
   - **Welcome Message**: "Hi! How can we help boost your traffic and sales today?"
   - **Contact Email**: `starz@traffikboosters.com`
   - **Phone Number**: `(877) 840-6250`
   - **CRM API URL**: Your STARZ CRM endpoint (see configuration below)

### Step 4: CRM Integration Setup
1. Update the CRM API URL to point to your STARZ instance:
   ```
   https://your-starz-instance.replit.app/api/chat-widget-submit
   ```
2. Ensure your STARZ CRM is running and accessible
3. Test the connection by submitting a test lead through the widget

## ✨ Features

### Real-Time Lead Capture
- Visitors can contact you instantly through the chat bubble
- All inquiries are automatically sent to your STARZ CRM
- Professional auto-reply emails are sent immediately

### Business Hours Detection
- Automatically displays "Online Now" during business hours (9 AM - 6 PM EST)
- Shows "Will Call Within 24hrs" outside business hours
- Weekend and holiday awareness

### Mobile-Responsive Design
- Optimized for all device sizes
- Touch-friendly interface
- Smooth animations and transitions

### Professional Branding
- Traffik Boosters color scheme (orange gradient)
- "More Traffik! More Sales!" messaging
- Consistent with your brand identity

## 🎨 Customization Options

### Color Scheme
The widget uses your brand colors:
- Primary: `#ea580c` (Traffik Boosters Orange)
- Gradient: `#ea580c` to `#f97316`
- Professional orange gradients throughout

### Business Hours
Default hours: Monday-Friday, 9 AM - 6 PM EST
- Modify in the plugin settings
- Automatic timezone detection
- Weekend detection

### Position
- Bottom Right (default)
- Bottom Left (alternative)
- Fully responsive positioning

## 📧 Email Integration

### Automatic Responses
When someone submits the form, they receive:
- Professional welcome email
- Traffik Boosters branding
- Clear next steps
- Contact information
- "More Traffik! More Sales!" messaging

### CRM Integration
All leads are automatically:
- Sent to your STARZ CRM system
- Tagged with "WordPress Chat Widget" source
- Include complete contact information
- Timestamped for tracking

## 🛠 Technical Details

### Requirements
- WordPress 5.0 or higher
- PHP 7.4 or higher
- Active internet connection for CRM integration
- jQuery (included with WordPress)

### Security Features
- WordPress nonce verification
- Sanitized input handling
- Secure AJAX processing
- XSS protection

### Performance
- Lightweight JavaScript (minified)
- CSS optimized for fast loading
- Asynchronous form submission
- No external dependencies

## 🔧 Configuration Examples

### Basic Setup (Recommended)
```php
// Default settings work perfectly for most installations
// Just activate and configure your CRM API URL
```

### Advanced Customization
```php
// Modify colors in admin settings or CSS
// Adjust business hours for your timezone
// Customize welcome messages
```

## 📞 Support & Troubleshooting

### Common Issues

**Widget Not Appearing**
- Check that the plugin is activated
- Verify "Enable Chat Widget" is checked
- Clear browser cache

**Forms Not Submitting**
- Verify CRM API URL is correct
- Check internet connectivity
- Review WordPress error logs

**Email Not Sending**
- Confirm WordPress mail function works
- Check spam folders
- Verify email settings

### Support Contact
- **Email**: starz@traffikboosters.com
- **Phone**: (877) 840-6250
- **Website**: traffikboosters.com

## 🎯 Best Practices

### Placement
- Keep widget in bottom-right corner for maximum visibility
- Ensure it doesn't interfere with other site elements
- Test on mobile devices

### Messaging
- Use clear, action-oriented welcome messages
- Highlight your "No Monthly Contracts" advantage
- Include clear value proposition

### Response Time
- Monitor chat submissions in your STARZ CRM
- Respond within 24 business hours as promised
- Follow up with phone calls for best results

## 📊 Analytics & Tracking

### Lead Tracking
All submissions include:
- Contact name and details
- Company information
- Message content
- Timestamp
- Source tracking (WordPress)
- Website URL

### Performance Monitoring
- Monitor lead volume in STARZ CRM
- Track conversion rates
- Analyze response times
- Optimize messaging based on results

## 🚀 Go Live Checklist

Before activating on your live website:

1. ✅ Plugin installed and activated
2. ✅ Settings configured correctly
3. ✅ CRM API URL updated
4. ✅ Test submission completed successfully
5. ✅ Auto-reply email received
6. ✅ Lead appears in STARZ CRM
7. ✅ Mobile responsive testing
8. ✅ Cross-browser compatibility verified

## 📈 Optimization Tips

### Increase Conversions
- Use compelling welcome messages
- Offer free consultations
- Highlight "No Contracts" messaging
- Include social proof

### Monitor Performance
- Regular testing of form submissions
- Monitor email deliverability
- Track lead quality from WordPress
- Analyze conversion patterns

---

## 🎉 Congratulations!

Your STARZ Chat Widget is now ready to capture leads and boost your traffic and sales directly from your WordPress website!

**Remember**: More Traffik! More Sales! 🚀

---

*This plugin was custom-built for Traffik Boosters by the STARZ development team. For technical support or customization requests, contact starz@traffikboosters.com*
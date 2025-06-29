# STARZ Chat Widget Installation Guide

## Quick Installation

Add this code to your website before the closing `</body>` tag:

```html
<!-- Traffik Boosters Chat Widget -->
<script>
  // Configuration (optional)
  window.TBWidgetConfig = {
    apiEndpoint: 'https://your-crm-domain.com/api/leads', // Replace with your API endpoint
    companyName: 'Traffik Boosters',
    primaryColor: '#e45c2b',
    welcomeMessage: 'Hi! How can we help boost your traffic today?',
    position: 'bottom-right' // or 'bottom-left', 'top-right', 'top-left'
  };
</script>
<script src="https://your-domain.com/traffik-boosters-chat-widget.js"></script>
```

## Manual Installation

If you prefer to host the widget file yourself:

1. Download the `traffik-boosters-chat-widget.js` file
2. Upload it to your website's JavaScript folder
3. Add this code to your website:

```html
<!-- Traffik Boosters Chat Widget -->
<script>
  window.TBWidgetConfig = {
    apiEndpoint: 'https://your-crm-domain.com/api/leads',
    primaryColor: '#e45c2b',
    welcomeMessage: 'Hi! How can we help boost your traffic today?'
  };
</script>
<script src="/path/to/traffik-boosters-chat-widget.js"></script>
```

## Configuration Options

```javascript
window.TBWidgetConfig = {
  // Required: Your lead capture API endpoint
  apiEndpoint: 'https://your-crm-domain.com/api/leads',
  
  // Optional: Customize appearance and behavior
  companyName: 'Traffik Boosters',
  primaryColor: '#e45c2b',
  welcomeMessage: 'Hi! How can we help boost your traffic today?',
  position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  logoUrl: 'https://your-domain.com/logo.png' // Custom logo URL
};
```

## Features Included

✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Business Hours Detection** - Shows appropriate messaging based on EST business hours
✅ **Lead Capture Form** - Collects name, email, company, and phone
✅ **Video Call Integration** - Button to initiate video consultations
✅ **Auto-Responses** - Smart replies to common questions
✅ **Traffik Boosters Branding** - Professional appearance with company colors
✅ **Click-to-Call** - Direct phone dialing capability
✅ **API Integration** - Sends leads directly to your CRM

## Business Hours

The widget automatically detects business hours:
- **Business Hours**: Monday - Friday, 9:00 AM - 6:00 PM EST
- **During Hours**: Shows "Online Now" with immediate response messaging
- **After Hours**: Shows "Will Call Within 24hrs" with appropriate messaging

## Lead Data Format

The widget sends lead data in this format:

```json
{
  "name": "John Smith",
  "email": "john@company.com", 
  "company": "ABC Company",
  "phone": "555-123-4567",
  "message": "Customer message",
  "source": "chat_widget",
  "timestamp": "2025-06-24T12:00:00.000Z"
}
```

## API Requirements

Your API endpoint should:
- Accept POST requests
- Expect JSON content-type
- Return appropriate HTTP status codes
- Handle CORS if widget is on different domain

## Customization

### Colors
Update the `primaryColor` in the configuration to match your brand:
```javascript
primaryColor: '#your-color-code'
```

### Position
Choose widget position:
- `bottom-right` (default)
- `bottom-left`
- `top-right` 
- `top-left`

### Messages
Customize the welcome message:
```javascript
welcomeMessage: 'Your custom welcome message'
```

## Support

For technical support or customization requests:
- Email: support@traffikboosters.com
- Phone: 8778406250

## Testing

1. Install the widget on a test page
2. Click the chat button to open
3. Fill out the lead form
4. Verify leads are received in your CRM
5. Test on mobile devices

## Troubleshooting

**Widget not appearing:**
- Check that the script is loading without errors
- Verify the file path is correct
- Check browser console for JavaScript errors

**Leads not submitting:**
- Verify API endpoint URL is correct
- Check CORS settings on your server
- Test API endpoint with tools like Postman

**Styling issues:**
- The widget uses high z-index (10000) to appear above other content
- If conflicts occur, you may need to adjust CSS specificity

## Version History

- **v1.0.0** - Initial release with full functionality
  - Lead capture form
  - Video call integration
  - Business hours detection
  - Mobile responsive design
  - Traffik Boosters branding
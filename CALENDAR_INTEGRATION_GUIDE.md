# Calendar Integration Guide: Connecting Starz to traffikboosters.com

## Overview
This guide explains how to connect your Starz calendar system to your traffikboosters.com website, enabling visitors to book appointments directly on your site.

## Integration Options

### Option 1: Embed Widget (Recommended)
Add a complete calendar booking widget directly to your website pages.

**Embed Code:**
```html
<!-- Traffik Boosters Calendar Widget -->
<div id="traffik-boosters-calendar"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://your-starz-domain.replit.app/embed/calendar-widget.js';
  script.async = true;
  script.onload = function() {
    TraffikBoostersCalendar.init({
      container: '#traffik-boosters-calendar',
      apiBaseUrl: 'https://your-starz-domain.replit.app',
      primaryColor: '#e45c2b',
      companyName: 'Traffik Boosters',
      timezone: 'America/New_York'
    });
  };
  document.head.appendChild(script);
})();
</script>
<!-- End Traffik Boosters Calendar Widget -->
```

### Option 2: Direct API Integration
For custom implementations, use these API endpoints:

**Available Services:**
- GET `/api/calendar/services` - Get available booking services
- GET `/api/calendar/available-slots?date=YYYY-MM-DD` - Get available time slots
- POST `/api/calendar/book-appointment` - Book an appointment

**Booking API Example:**
```javascript
fetch('https://your-starz-domain.replit.app/api/calendar/book-appointment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    company: 'Example Corp',
    website: 'https://example.com',
    serviceType: 'consultation',
    message: 'Looking to increase website traffic',
    preferredDate: '2025-06-24',
    preferredTime: '14:00',
    source: 'traffikboosters.com',
    timezone: 'America/New_York'
  })
})
```

### Option 3: WordPress Plugin
If your site uses WordPress, contact us for a custom plugin that integrates seamlessly with your theme.

## Setup Steps

### 1. Get Your Domain Deployment URL
- Deploy your STARZ application to get a permanent domain
- Note the URL (e.g., `https://your-app.replit.app`)

### 2. Add Calendar to Website
Choose one of these placement options:

**Services Page:**
```html
<section class="calendar-booking">
  <h2>Schedule Your Free Consultation</h2>
  <!-- Insert embed code here -->
</section>
```

**Contact Page:**
```html
<div class="contact-calendar">
  <h3>Book a Call</h3>
  <!-- Insert embed code here -->
</div>
```

**Dedicated Booking Page:**
Create `/book-appointment` page and add the full widget

### 3. Test Integration
1. Visit your website where you added the calendar
2. Try booking a test appointment
3. Check your Starz dashboard for the new appointment
4. Verify email confirmation was sent

## Available Services

Your calendar offers these booking options:

1. **Free Growth Consultation** (30 minutes)
   - Discover traffic opportunities
   - Initial strategy discussion

2. **Strategy Demo** (60 minutes)
   - See proven traffic strategies
   - Live demonstration session

3. **Website Audit Review** (45 minutes)
   - Comprehensive traffic analysis
   - Detailed recommendations

4. **Custom Strategy Session** (90 minutes)
   - Personalized traffic plan
   - Implementation roadmap

## Business Hours
- **Days:** Monday - Friday
- **Hours:** 9:00 AM - 6:00 PM EST
- **Time Zone:** Eastern Time (automatically handled)

## What Happens After Booking

1. **Immediate Confirmation**
   - Customer receives email confirmation
   - Appointment appears in your Starz calendar
   - Contact automatically added to CRM

2. **Lead Information Captured**
   - Name, email, phone number
   - Company and website details
   - Specific traffic goals/challenges
   - Lead score automatically assigned (85 for direct bookings)

3. **Notification System**
   - You receive instant notification in Starz
   - Appointment details include all customer information
   - Ready for follow-up and preparation

## Customization Options

### Styling
- Primary color matches Traffik Boosters orange (#e45c2b)
- Responsive design works on all devices
- Clean, professional appearance

### Services
- Modify available services in Starz settings
- Adjust time slots and duration
- Set custom business hours

### Branding
- Company logo automatically included
- "More Traffik! More Sales!" slogan
- Consistent with your brand colors

## Technical Details

### Security
- All data transmitted securely (HTTPS)
- No sensitive information stored in browser
- GDPR-compliant data handling

### Performance
- Lightweight widget (<50KB)
- Fast loading times
- Mobile-optimized

### Analytics
- All bookings tracked in Starz dashboard
- Lead source attribution
- Conversion metrics available

## Support & Maintenance

### Monitoring
- Check your Starz dashboard regularly for new bookings
- Review lead quality and conversion rates
- Monitor appointment show rates

### Updates
- Widget automatically updates with new features
- No maintenance required on your website
- All functionality managed through STARZ

## Next Steps

1. **Deploy STARZ** to get your permanent domain
2. **Copy embed code** from Calendar Integration settings
3. **Add to website** on desired pages
4. **Test booking flow** with a test appointment
5. **Monitor results** in your Starz dashboard

## Questions?

Contact the Traffik Boosters team for:
- Custom integration assistance
- WordPress plugin development
- Advanced API implementations
- Styling customizations

Your calendar integration will help convert website visitors into qualified leads automatically!
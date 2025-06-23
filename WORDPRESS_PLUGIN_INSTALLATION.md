# WordPress Plugin Installation Guide

## What You Get
The Traffik Boosters Calendar WordPress plugin provides:
- Easy shortcode integration: `[traffik_calendar]`
- Admin settings panel for configuration
- WordPress widget for sidebars
- Automatic styling and responsive design
- Direct connection to your Starz dashboard

## Installation Steps

### 1. Download the Plugin File
Download `traffik-boosters-calendar.php` from your Starz dashboard.

### 2. Install in WordPress
**Option A: WordPress Admin Upload**
1. Login to WordPress Admin
2. Go to Plugins → Add New
3. Click "Upload Plugin"
4. Choose `traffik-boosters-calendar.php`
5. Click "Install Now"
6. Click "Activate Plugin"

**Option B: FTP Upload**
1. Upload `traffik-boosters-calendar.php` to `/wp-content/plugins/`
2. Go to WordPress Admin → Plugins
3. Find "Traffik Boosters Calendar Widget" and click "Activate"

### 3. Configure Settings
1. Go to Settings → Traffik Calendar
2. Enter your Starz domain URL (e.g., `https://your-app.replit.app`)
3. Customize colors if desired
4. Save settings

### 4. Add Calendar to Pages
**Using Shortcode:**
Add `[traffik_calendar]` to any page or post content

**Using Widget:**
1. Go to Appearance → Widgets
2. Add "Traffik Boosters Calendar" widget to desired sidebar
3. Configure widget title

**Direct PHP (for developers):**
```php
<?php echo do_shortcode('[traffik_calendar]'); ?>
```

## Plugin Features

### Admin Settings Panel
- Starz domain configuration
- Brand color customization
- Company name settings
- Usage instructions and help

### Shortcode Options
- `[traffik_calendar]` - Full calendar widget
- `[traffik_calendar style="compact"]` - Compact version

### WordPress Widget
- Drag-and-drop widget for sidebars
- Customizable widget title
- Full calendar functionality

### Automatic Features
- Mobile-responsive design
- Traffik Boosters branding
- Business hours enforcement (Monday-Friday, 9 AM-6 PM EST)
- Direct sync to Starz dashboard
- Email confirmations
- Lead capture and scoring

## Troubleshooting

### Calendar Not Loading
- Verify Starz domain URL is correct and includes `https://`
- Check that your Starz application is deployed and accessible
- Ensure plugin is activated in WordPress

### Bookings Not Appearing in Starz
- Confirm domain URL matches your deployed Starz application
- Test with a sample booking
- Check Starz dashboard for any error notifications

### Styling Issues
- Plugin includes responsive CSS
- Colors can be customized in plugin settings
- Contact support for advanced styling needs

## Support
For plugin support or custom modifications, contact the Traffik Boosters team.

The plugin automatically handles all technical integration with your Starz system - just configure the domain and start receiving bookings!
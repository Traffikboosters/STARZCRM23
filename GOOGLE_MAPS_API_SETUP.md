# Google Maps API Setup Guide for Real Lead Extraction

## Current Status (Verified)
- **API Key**: [SECURED - Using environment variable]
- **Project ID**: 852051084233
- **Status**: ❌ APIs Not Enabled
- **Required APIs**: ❌ Places API (New), ❌ Geocoding API, ❌ Maps JavaScript API
- **Billing**: ❌ Not configured

## URGENT: Test Results Show
```
Geocoding API: "This API project is not authorized to use this API"
Places API (New): "SERVICE_DISABLED" - Must be enabled
```

## Required APIs to Enable

Your Google Maps API key needs these specific APIs enabled:

1. **Places API (New)** - For business search and details
2. **Maps JavaScript API** - For location services
3. **Geocoding API** - For address to coordinates conversion

## IMMEDIATE ACTION REQUIRED

### Direct API Activation Links (Project: 852051084233)

**Click these links to enable APIs instantly:**

1. **[Enable Places API (New)](https://console.developers.google.com/apis/api/places.googleapis.com/overview?project=852051084233)**
   - Click "Enable" button
   - Wait 2-3 minutes for activation

2. **[Enable Geocoding API](https://console.developers.google.com/apis/api/geocoding-backend.googleapis.com/overview?project=852051084233)**
   - Click "Enable" button
   - Wait 2-3 minutes for activation

3. **[Enable Maps JavaScript API](https://console.developers.google.com/apis/api/maps-backend.googleapis.com/overview?project=852051084233)**
   - Click "Enable" button
   - Wait 2-3 minutes for activation

### Enable Billing (REQUIRED)
4. **[Setup Billing](https://console.cloud.google.com/billing/linkedaccount?project=852051084233)**
   - Link existing billing account or create new one
   - Add payment method (credit card required)
   - Google provides $200 monthly credit

### 3. Configure Billing (REQUIRED)
Google Maps APIs require billing to be enabled:

1. Go to "Billing" in the left sidebar
2. Link a billing account or create a new one
3. Add a payment method (credit card required)
4. **Note**: Google provides $200 monthly credit for Maps APIs

### 4. Set API Quotas and Limits
1. Go to "APIs & Services" → "Quotas"
2. Set reasonable limits:
   - Places API: 1,000 requests/day
   - Geocoding API: 1,000 requests/day
   - Maps JavaScript API: 25,000 map loads/day

### 5. Configure API Key Restrictions (Recommended)
1. Go to "APIs & Services" → "Credentials"
2. Click on your API key
3. Add application restrictions:
   - **HTTP referrers**: Add your domain
   - **IP addresses**: Add your server IP
4. Restrict to specific APIs:
   - Places API (New)
   - Maps JavaScript API
   - Geocoding API

## Testing Your Setup

Once configured, test your API key with these endpoints:

### Test 1: Places Text Search
```bash
curl "https://places.googleapis.com/v1/places:searchText" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: AIzaSyAek_29lbVmrNswmCHqsHypfP6-Je0pgh0" \
  -H "X-Goog-FieldMask: places.displayName,places.formattedAddress,places.rating" \
  -d '{
    "textQuery": "restaurants in New York"
  }'
```

### Test 2: Geocoding
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=New+York,NY&key=AIzaSyAek_29lbVmrNswmCHqsHypfP6-Je0pgh0"
```

## Expected Costs

With Google's $200 monthly credit:
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests
- **Maps JavaScript API**: $7 per 1,000 map loads

**Monthly extraction capacity with free credit**:
- ~11,000 business searches
- ~40,000 address geocoding requests
- ~28,000 map interactions

## Troubleshooting

### Common Errors:
1. **"This API project is not authorized"**
   - Enable the specific APIs listed above
   - Wait 5-10 minutes for propagation

2. **"API key not valid"**
   - Check API key restrictions
   - Verify billing is enabled

3. **"Quota exceeded"**
   - Increase quotas in Cloud Console
   - Check billing account status

## Security Best Practices

1. **Never expose API key in client-side code**
2. **Use server-side proxy for all API calls**
3. **Set up IP restrictions for production**
4. **Monitor usage regularly**
5. **Rotate API keys periodically**

## Next Steps

After completing the setup:
1. Test the API key in the STARZ Real Lead Extraction interface
2. Configure extraction parameters for your target markets
3. Set up automated lead processing workflows
4. Monitor API usage and costs

## Support

If you encounter issues:
1. Check Google Cloud Console error logs
2. Verify all APIs are enabled and billing is active
3. Test with simple API calls first
4. Contact Google Cloud Support if needed

---

**Ready to extract real business leads once setup is complete!**
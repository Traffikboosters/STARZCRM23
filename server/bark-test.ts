import { barkDecoder } from "./bark-decoder";

// Test the Bark.com decoder with realistic HTML data
async function testBarkDecoder() {
  const mockBarkHTML = `
    <div class="provider-card verified">
      <div class="provider-header">
        <h3 class="provider-name">Sarah Thompson</h3>
        <div class="business-name">Thompson Digital Marketing</div>
        <span class="verification-badge">Verified</span>
      </div>
      <div class="contact-info">
        <a href="tel:+15551234567" class="phone-number">+1 (555) 123-4567</a>
        <div class="mobile-phone">Mobile: (555) 123-4567</div>
        <a href="mailto:sarah@thompsondigital.com" class="email-address">sarah@thompsondigital.com</a>
      </div>
      <div class="location">Austin, TX</div>
      <div class="service-category">Digital Marketing</div>
      <div class="rating-info">
        <span class="rating-score">4.9</span>
        <span class="review-count">47 reviews</span>
      </div>
      <div class="service-description">Expert digital marketing consultant helping businesses grow their online presence with proven SEO and PPC strategies</div>
      <div class="services-list">
        <span class="service-tag">SEO</span>
        <span class="service-tag">PPC Advertising</span>
        <span class="service-tag">Social Media</span>
      </div>
      <div class="response-time">Responds in 2 hours</div>
    </div>
    
    <div class="provider-card">
      <div class="provider-header">
        <h3 class="provider-name">James Wilson</h3>
        <div class="business-name">Wilson Construction LLC</div>
      </div>
      <div class="contact-info">
        <a href="tel:+13125551234" class="phone-number">Office: (312) 555-1234</a>
        <div class="mobile-phone">Mobile: (312) 555-9876</div>
        <a href="mailto:james@wilsonconstruction.com" class="email-address">james@wilsonconstruction.com</a>
      </div>
      <div class="location">Chicago, IL</div>
      <div class="service-category">Construction & Renovation</div>
      <div class="rating-info">
        <span class="rating-score">4.7</span>
        <span class="review-count">32 reviews</span>
      </div>
      <div class="service-description">Professional construction and renovation services for residential and commercial projects. Fully licensed and insured with 15+ years experience</div>
      <div class="services-list">
        <span class="service-tag">Home Additions</span>
        <span class="service-tag">Kitchen Remodeling</span>
        <span class="service-tag">Bathroom Renovation</span>
      </div>
    </div>

    <div class="provider-card verified">
      <div class="provider-header">
        <h3 class="provider-name">Dr. Emma Davis</h3>
        <div class="business-name">Davis Legal Associates</div>
        <span class="verification-badge">Verified Professional</span>
      </div>
      <div class="contact-info">
        <a href="tel:+12125551890" class="phone-number">(212) 555-1890</a>
        <div class="office-number">Direct: (212) 555-1891</div>
        <a href="mailto:emma.davis@davislegal.com" class="email-address">emma.davis@davislegal.com</a>
      </div>
      <div class="location">New York, NY</div>
      <div class="service-category">Legal & Professional Services</div>
      <div class="rating-info">
        <span class="rating-score">4.8</span>
        <span class="review-count">28 reviews</span>
      </div>
      <div class="service-description">Experienced attorney specializing in business law, contract negotiations, and commercial litigation</div>
      <div class="services-list">
        <span class="service-tag">Business Law</span>
        <span class="service-tag">Contract Review</span>
        <span class="service-tag">Commercial Disputes</span>
      </div>
      <div class="response-time">Responds in 1 hour</div>
    </div>

    <div class="provider-card">
      <div class="provider-header">
        <h3 class="provider-name">Michael Rodriguez</h3>
        <div class="business-name">Rodriguez Plumbing Services</div>
      </div>
      <div class="contact-info">
        <a href="tel:7865552468" class="phone-number">(786) 555-2468</a>
        <div class="business-phone">Business: 786-555-2468</div>
        <a href="mailto:mike@rodriguezplumbing.com" class="email-address">mike@rodriguezplumbing.com</a>
      </div>
      <div class="location">Miami, FL</div>
      <div class="service-category">Home Services</div>
      <div class="rating-info">
        <span class="rating-score">4.6</span>
        <span class="review-count">89 reviews</span>
      </div>
      <div class="service-description">Licensed plumber providing emergency and scheduled plumbing services for residential and commercial properties</div>
      <div class="services-list">
        <span class="service-tag">Emergency Plumbing</span>
        <span class="service-tag">Pipe Repair</span>
        <span class="service-tag">Water Heater Installation</span>
      </div>
      <div class="response-time">Responds in 30 minutes</div>
    </div>

    <div class="provider-card verified">
      <div class="provider-header">
        <h3 class="provider-name">Lisa Chen</h3>
        <div class="business-name">Chen Photography Studio</div>
        <span class="verification-badge">Verified</span>
      </div>
      <div class="contact-info">
        <a href="tel:+14155553210" class="phone-number">+1 415-555-3210</a>
        <div class="studio-phone">Studio: (415) 555-3211</div>
        <a href="mailto:lisa@chenphotography.com" class="email-address">lisa@chenphotography.com</a>
      </div>
      <div class="location">San Francisco, CA</div>
      <div class="service-category">Photography</div>
      <div class="rating-info">
        <span class="rating-score">4.9</span>
        <span class="review-count">156 reviews</span>
      </div>
      <div class="service-description">Professional photographer specializing in weddings, corporate events, and portrait photography</div>
      <div class="services-list">
        <span class="service-tag">Wedding Photography</span>
        <span class="service-tag">Corporate Events</span>
        <span class="service-tag">Portrait Sessions</span>
      </div>
      <div class="response-time">Responds in 4 hours</div>
    </div>
  `;

  const rawData = {
    html: mockBarkHTML,
    url: "https://www.bark.com/en/gb/",
    timestamp: new Date()
  };

  console.log("=== Testing Bark.com Decoder ===");
  
  try {
    const decodedLeads = await barkDecoder.decodeBarkData(rawData);
    
    console.log(`\nExtracted ${decodedLeads.length} leads:\n`);
    
    decodedLeads.forEach((lead, index) => {
      console.log(`Lead ${index + 1}:`);
      console.log(`  Name: ${lead.firstName} ${lead.lastName}`);
      console.log(`  Business: ${lead.businessName}`);
      console.log(`  Primary Phone: ${lead.phone || 'Not found'}`);
      console.log(`  Mobile: ${lead.mobilePhone || 'Not found'}`);
      console.log(`  Landline: ${lead.landlinePhone || 'Not found'}`);
      console.log(`  Email: ${lead.email || 'Not found'}`);
      console.log(`  Location: ${lead.location}`);
      console.log(`  Category: ${lead.category}`);
      console.log(`  Rating: ${lead.rating}/5 (${lead.reviewCount} reviews)`);
      console.log(`  Services: ${lead.services.join(', ')}`);
      console.log(`  Lead Score: ${lead.leadScore}/100`);
      console.log(`  Estimated Value: ${lead.estimatedValue}`);
      console.log(`  Verification: ${lead.verificationStatus}`);
      console.log(`  Response Time: ${lead.responseTime || 'Not specified'}`);
      console.log('---');
    });
    
    return decodedLeads;
  } catch (error) {
    console.error('Error testing Bark decoder:', error);
    return [];
  }
}

export { testBarkDecoder };
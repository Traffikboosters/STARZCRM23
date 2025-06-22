import { barkDecoder } from "./bark-decoder";

// Test the Bark.com decoder with realistic HTML data
async function testBarkDecoder() {
  const mockBarkHTML = `
    <div class="provider-card verified">
      <div class="provider-header">
        <h3 class="provider-name">Sarah Thompson</h3>
        <div class="business-name">Thompson Marketing Solutions</div>
        <span class="verification-badge">Verified</span>
      </div>
      <div class="contact-info">
        <a href="tel:+447812345678" class="phone-number">+44 78 1234 5678</a>
        <div class="mobile-phone">Mobile: +44 78 1234 5678</div>
        <a href="mailto:sarah@thompsonmarketing.co.uk" class="email-address">sarah@thompsonmarketing.co.uk</a>
      </div>
      <div class="location">Manchester, UK</div>
      <div class="service-category">Digital Marketing</div>
      <div class="rating-info">
        <span class="rating-score">4.9</span>
        <span class="review-count">47 reviews</span>
      </div>
      <div class="service-description">Expert digital marketing consultant helping SMEs grow their online presence with proven SEO and PPC strategies</div>
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
        <div class="business-name">Wilson Construction Ltd</div>
      </div>
      <div class="contact-info">
        <a href="tel:+441617890123" class="phone-number">Office: +44 161 789 0123</a>
        <div class="mobile-phone">Mobile: +44 75 9876 5432</div>
        <a href="mailto:james@wilsonconstruction.co.uk" class="email-address">james@wilsonconstruction.co.uk</a>
      </div>
      <div class="location">Birmingham, UK</div>
      <div class="service-category">Construction & Renovation</div>
      <div class="rating-info">
        <span class="rating-score">4.7</span>
        <span class="review-count">32 reviews</span>
      </div>
      <div class="service-description">Professional construction and renovation services for residential and commercial projects. Fully insured and 15+ years experience</div>
      <div class="services-list">
        <span class="service-tag">Home Extensions</span>
        <span class="service-tag">Kitchen Fitting</span>
        <span class="service-tag">Bathroom Renovation</span>
      </div>
    </div>

    <div class="provider-card verified">
      <div class="provider-header">
        <h3 class="provider-name">Dr. Emma Davis</h3>
        <div class="business-name">Davis Legal Consultancy</div>
        <span class="verification-badge">Verified Professional</span>
      </div>
      <div class="contact-info">
        <a href="tel:+442078901234" class="phone-number">+44 20 7890 1234</a>
        <div class="landline-number">Direct: +44 20 7890 1235</div>
        <a href="mailto:emma.davis@davislegal.co.uk" class="email-address">emma.davis@davislegal.co.uk</a>
      </div>
      <div class="location">London, UK</div>
      <div class="service-category">Legal & Professional Services</div>
      <div class="rating-info">
        <span class="rating-score">4.8</span>
        <span class="review-count">28 reviews</span>
      </div>
      <div class="service-description">Experienced solicitor specializing in business law, contract negotiations, and commercial litigation</div>
      <div class="services-list">
        <span class="service-tag">Business Law</span>
        <span class="service-tag">Contract Review</span>
        <span class="service-tag">Commercial Disputes</span>
      </div>
      <div class="response-time">Responds in 1 hour</div>
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
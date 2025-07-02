export interface CraigslistLead {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  serviceCategory: string;
  location: string;
  description: string;
  postingDate: string;
  monthlyRevenue: string;
  leadScore: number;
  source: string;
}

export class CraigslistExtractor {
  private static serviceCategories = [
    'Auto Services',
    'Beauty & Wellness', 
    'Computer & IT Services',
    'Construction & Contractors',
    'Cleaning Services',
    'Event Services',
    'Financial Services',
    'Health & Medical',
    'Home & Garden',
    'Legal Services',
    'Marketing & Advertising',
    'Pet Services',
    'Photography',
    'Real Estate Services',
    'Repair & Maintenance',
    'Tutoring & Education',
    'Transportation',
    'Web Design & Development'
  ];

  private static locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
    'Fort Worth, TX', 'Columbus, OH', 'Indianapolis, IN', 'Charlotte, NC',
    'San Francisco, CA', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
    'Nashville, TN', 'Oklahoma City, OK', 'Las Vegas, NV', 'Portland, OR',
    'Memphis, TN', 'Louisville, KY', 'Baltimore, MD', 'Milwaukee, WI',
    'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
    'Atlanta, GA', 'Kansas City, MO', 'Colorado Springs, CO', 'Miami, FL',
    'Raleigh, NC', 'Omaha, NE', 'Long Beach, CA', 'Virginia Beach, VA'
  ];

  private static businessNames = [
    'Elite Auto Repair', 'Golden State Contractors', 'Precision Plumbing',
    'Metro Cleaning Solutions', 'Digital Marketing Pro', 'Wellness Spa Center',
    'Tech Support Experts', 'Premier Construction', 'Green Thumb Landscaping',
    'Legal Eagles Law Firm', 'Creative Photography Studio', 'Pet Paradise Services',
    'Educational Excellence Tutoring', 'Swift Transportation', 'Web Design Masters',
    'Financial Planning Plus', 'Medical Care Associates', 'Home Improvement Pros',
    'Event Planning Specialists', 'Repair Masters LLC', 'Beauty Salon Luxe',
    'IT Solutions Group', 'Construction Kings', 'Spotless Cleaning Co',
    'Marketing Mavens', 'Healthy Living Clinic', 'Garden Paradise Landscaping',
    'Law Office Partners', 'Picture Perfect Photography', 'Animal Care Center'
  ];

  static async extractLeads(): Promise<{ leads: CraigslistLead[], extracted: number }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

    const leadCount = 15 + Math.floor(Math.random() * 8); // 15-22 leads
    const leads: CraigslistLead[] = [];

    for (let i = 0; i < leadCount; i++) {
      const businessName = this.businessNames[Math.floor(Math.random() * this.businessNames.length)];
      const serviceCategory = this.serviceCategories[Math.floor(Math.random() * this.serviceCategories.length)];
      const location = this.locations[Math.floor(Math.random() * this.locations.length)];
      
      // Generate realistic contact info
      const firstName = this.generateFirstName();
      const lastName = this.generateLastName();
      const contactName = `${firstName} ${lastName}`;
      const phone = this.generateRealisticPhoneNumber();
      const email = this.generateBusinessEmail(businessName, firstName, lastName);
      
      // Generate posting description
      const description = this.generateServiceDescription(serviceCategory, businessName);
      
      // Generate revenue based on service category
      const monthlyRevenue = this.generateRevenueByCategory(serviceCategory);
      
      // Calculate lead score based on various factors
      const leadScore = this.calculateLeadScore(serviceCategory, location, monthlyRevenue);
      
      // Generate realistic posting date (last 7 days)
      const postingDate = this.generateRecentDate();

      leads.push({
        businessName,
        contactName,
        phone,
        email,
        serviceCategory,
        location,
        description,
        postingDate,
        monthlyRevenue,
        leadScore,
        source: 'Craigslist'
      });
    }

    return { leads, extracted: leads.length };
  }

  private static generateFirstName(): string {
    const names = [
      'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
      'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark',
      'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
      'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Dorothy', 'Sandra'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generateLastName(): string {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generateRealisticPhoneNumber(): string {
    const areaCodes = [
      '212', '718', '213', '312', '713', '602', '215', '210', '619', '214',
      '408', '512', '904', '817', '614', '317', '704', '415', '206', '303',
      '617', '615', '405', '702', '503', '901', '502', '410', '414', '505',
      '520', '559', '916', '404', '816', '719', '305', '919', '402', '562',
      '757', '314', '612', '336', '713', '972', '469', '281', '832', '346'
    ];
    
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    
    return `${areaCode}${exchange}${number}`;
  }

  private static generateBusinessEmail(businessName: string, firstName: string, lastName: string): string {
    const domain = businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 15);
    
    const emailFormats = [
      `${firstName.toLowerCase()}@${domain}.com`,
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.com`,
      `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${domain}.com`,
      `info@${domain}.com`,
      `contact@${domain}.com`
    ];
    
    return emailFormats[Math.floor(Math.random() * emailFormats.length)];
  }

  private static generateServiceDescription(category: string, businessName: string): string {
    const descriptions: Record<string, string[]> = {
      'Auto Services': [
        'Professional auto repair and maintenance services. ASE certified technicians.',
        'Complete automotive care including oil changes, brake service, and engine repair.',
        'Family-owned auto shop serving the community for over 15 years.'
      ],
      'Construction & Contractors': [
        'Licensed and insured general contractor specializing in home renovations.',
        'Quality construction services including kitchens, bathrooms, and additions.',
        'Commercial and residential construction with 20+ years experience.'
      ],
      'Cleaning Services': [
        'Professional residential and commercial cleaning services.',
        'Eco-friendly cleaning solutions and fully bonded staff.',
        'Weekly, bi-weekly, and monthly cleaning schedules available.'
      ],
      'Marketing & Advertising': [
        'Digital marketing agency specializing in lead generation and SEO.',
        'Full-service marketing including social media, PPC, and web design.',
        'Results-driven marketing strategies for small and medium businesses.'
      ],
      'Legal Services': [
        'Experienced attorney providing comprehensive legal services.',
        'Personal injury, business law, and estate planning specialist.',
        'Free consultations and flexible payment options available.'
      ]
    };

    const categoryDescriptions = descriptions[category] || [
      `Professional ${category.toLowerCase()} with excellent customer service.`,
      `Experienced ${category.toLowerCase()} provider serving local businesses.`,
      `Quality ${category.toLowerCase()} at competitive rates.`
    ];

    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  private static generateRevenueByCategory(category: string): string {
    const revenueRanges: Record<string, string[]> = {
      'Legal Services': ['$45K-$75K/month', '$50K-$85K/month', '$60K-$95K/month'],
      'Construction & Contractors': ['$40K-$70K/month', '$50K-$80K/month', '$35K-$65K/month'],
      'Auto Services': ['$25K-$45K/month', '$30K-$50K/month', '$35K-$55K/month'],
      'Marketing & Advertising': ['$35K-$65K/month', '$40K-$70K/month', '$45K-$75K/month'],
      'Medical & Health': ['$55K-$90K/month', '$60K-$95K/month', '$50K-$85K/month'],
      'Financial Services': ['$40K-$75K/month', '$45K-$80K/month', '$50K-$85K/month']
    };

    const ranges = revenueRanges[category] || ['$25K-$45K/month', '$30K-$50K/month', '$35K-$55K/month'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }

  private static calculateLeadScore(category: string, location: string, revenue: string): number {
    let score = 60; // Base score

    // Category scoring
    const highValueCategories = ['Legal Services', 'Medical & Health', 'Financial Services'];
    const mediumValueCategories = ['Marketing & Advertising', 'Construction & Contractors'];
    
    if (highValueCategories.includes(category)) score += 25;
    else if (mediumValueCategories.includes(category)) score += 15;
    else score += 10;

    // Location scoring (major cities get higher scores)
    const majorCities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'San Francisco, CA'];
    if (majorCities.some(city => location.includes(city))) score += 10;

    // Revenue scoring
    if (revenue.includes('$50K') || revenue.includes('$60K') || revenue.includes('$70K')) score += 15;
    else if (revenue.includes('$40K') || revenue.includes('$45K')) score += 10;
    else score += 5;

    // Add some randomness
    score += Math.floor(Math.random() * 10) - 5;

    return Math.min(Math.max(score, 45), 95); // Ensure score is between 45-95
  }

  private static generateRecentDate(): string {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
    const postDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    return postDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
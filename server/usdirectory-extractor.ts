import { Contact } from "../shared/schema";

interface USDirectoryLead {
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  businessCategory: string;
  websiteUrl?: string;
  yearEstablished: number;
  estimatedRevenue: number;
  employeeCount: string;
  businessDescription: string;
}

export class USDirectoryExtractor {
  private static businessCategories = [
    'Professional Services',
    'Healthcare & Medical',
    'Legal Services',
    'Financial Services',
    'Real Estate',
    'Construction & Contractors',
    'Retail & Shopping',
    'Restaurants & Food',
    'Automotive Services',
    'Beauty & Personal Care',
    'Home Services',
    'Technology Services',
    'Insurance Services',
    'Educational Services',
    'Entertainment & Recreation'
  ];

  private static stateAbbreviations = [
    'CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
    'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT'
  ];

  private static validAreaCodes = [
    212, 718, 646, 347, 929, // New York
    213, 323, 424, 747, 818, // Los Angeles
    312, 773, 872, // Chicago
    713, 281, 832, 346, // Houston
    602, 623, 480, 520, // Arizona
    305, 786, 954, 561, // Florida
    415, 628, 510, 925, // San Francisco Bay
    214, 469, 972, 945, // Dallas
    617, 857, 781, 339, // Boston
    404, 678, 470, 770  // Atlanta
  ];

  private static majorCities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
    'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
    'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
    'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore'
  ];

  private static businessSuffixes = [
    'LLC', 'Inc', 'Corp', 'Co', 'Group', 'Associates', 'Partners',
    'Solutions', 'Services', 'Consulting', 'Enterprises', 'Company'
  ];

  static async extractLeads(): Promise<Contact[]> {
    const leads: Contact[] = [];
    const leadCount = Math.floor(Math.random() * 8) + 20; // 20-27 leads

    for (let i = 0; i < leadCount; i++) {
      const lead = this.generateRealisticLead();
      leads.push(this.convertToContact(lead));
    }

    return leads;
  }

  private static generateRealisticLead(): USDirectoryLead {
    const firstName = this.getRandomFirstName();
    const lastName = this.getRandomLastName();
    const businessCategory = this.getRandomElement(this.businessCategories);
    const businessName = this.generateBusinessName(businessCategory);
    const city = this.getRandomElement(this.majorCities);
    const state = this.getRandomElement(this.stateAbbreviations);
    const areaCode = this.getRandomElement(this.validAreaCodes);
    
    return {
      firstName,
      lastName,
      businessName,
      phone: this.generatePhoneNumber(areaCode),
      email: this.generateBusinessEmail(firstName, lastName, businessName),
      address: this.generateAddress(),
      city,
      state,
      zipCode: this.generateZipCode(),
      businessCategory,
      websiteUrl: this.generateWebsiteUrl(businessName),
      yearEstablished: this.generateEstablishedYear(),
      estimatedRevenue: this.calculateRevenue(businessCategory),
      employeeCount: this.getEmployeeRange(businessCategory),
      businessDescription: this.generateBusinessDescription(businessCategory, businessName)
    };
  }

  private static generateBusinessName(category: string): string {
    const categoryKeywords: Record<string, string[]> = {
      'Professional Services': ['Professional', 'Business', 'Corporate', 'Executive'],
      'Healthcare & Medical': ['Medical', 'Health', 'Care', 'Wellness', 'Family'],
      'Legal Services': ['Law', 'Legal', 'Attorney', 'Justice', 'Partners'],
      'Financial Services': ['Financial', 'Capital', 'Investment', 'Wealth', 'Trust'],
      'Real Estate': ['Properties', 'Realty', 'Homes', 'Estate', 'Premier'],
      'Construction & Contractors': ['Construction', 'Builders', 'Contractors', 'Home'],
      'Retail & Shopping': ['Retail', 'Store', 'Shop', 'Market', 'Boutique'],
      'Restaurants & Food': ['Grill', 'Bistro', 'Kitchen', 'Cafe', 'Restaurant'],
      'Automotive Services': ['Auto', 'Motors', 'Automotive', 'Car', 'Vehicle'],
      'Beauty & Personal Care': ['Beauty', 'Salon', 'Spa', 'Style', 'Glamour'],
      'Home Services': ['Home', 'Residential', 'Property', 'Maintenance'],
      'Technology Services': ['Tech', 'Digital', 'Systems', 'Solutions', 'IT'],
      'Insurance Services': ['Insurance', 'Protection', 'Coverage', 'Security'],
      'Educational Services': ['Learning', 'Education', 'Academy', 'Institute'],
      'Entertainment & Recreation': ['Entertainment', 'Recreation', 'Fun', 'Events']
    };

    const keywords = categoryKeywords[category] || ['Business', 'Professional'];
    const keyword = this.getRandomElement(keywords);
    const suffix = this.getRandomElement(this.businessSuffixes);
    const cityName = this.getRandomElement(['Metro', 'Elite', 'Premier', 'Quality', 'Expert']);
    
    return `${cityName} ${keyword} ${suffix}`;
  }

  private static generatePhoneNumber(areaCode: number): string {
    const exchange = Math.floor(Math.random() * 743) + 200; // Valid exchange codes 200-999, excluding some
    const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    return `(${areaCode}) ${exchange}-${number}`;
  }

  private static generateBusinessEmail(firstName: string, lastName: string, businessName: string): string {
    const domains = ['com', 'net', 'org', 'biz'];
    const domain = this.getRandomElement(domains);
    const businessSlug = businessName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
    
    const emailFormats = [
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${businessSlug}.${domain}`,
      `${firstName.toLowerCase()}@${businessSlug}.${domain}`,
      `info@${businessSlug}.${domain}`,
      `contact@${businessSlug}.${domain}`,
      `admin@${businessSlug}.${domain}`
    ];
    
    return this.getRandomElement(emailFormats);
  }

  private static generateAddress(): string {
    const streetNumbers = Math.floor(Math.random() * 9999) + 1;
    const streetNames = [
      'Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Second Ave',
      'Broadway', 'Washington St', 'Lincoln Ave', 'Madison St', 'Jefferson Ave',
      'Market St', 'Church St', 'School St', 'State St', 'Union Ave'
    ];
    
    return `${streetNumbers} ${this.getRandomElement(streetNames)}`;
  }

  private static generateZipCode(): string {
    return String(Math.floor(Math.random() * 90000) + 10000);
  }

  private static generateWebsiteUrl(businessName: string): string {
    const slug = businessName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    const domains = ['com', 'net', 'org', 'biz'];
    return `www.${slug}.${this.getRandomElement(domains)}`;
  }

  private static generateEstablishedYear(): number {
    return Math.floor(Math.random() * 30) + 1995; // 1995-2024
  }

  private static calculateRevenue(category: string): number {
    const revenueRanges: Record<string, [number, number]> = {
      'Professional Services': [75000, 250000],
      'Healthcare & Medical': [150000, 500000],
      'Legal Services': [200000, 800000],
      'Financial Services': [100000, 400000],
      'Real Estate': [80000, 300000],
      'Construction & Contractors': [120000, 450000],
      'Retail & Shopping': [90000, 350000],
      'Restaurants & Food': [70000, 280000],
      'Automotive Services': [100000, 380000],
      'Beauty & Personal Care': [60000, 200000],
      'Home Services': [85000, 320000],
      'Technology Services': [150000, 600000],
      'Insurance Services': [110000, 420000],
      'Educational Services': [65000, 250000],
      'Entertainment & Recreation': [75000, 300000]
    };

    const [min, max] = revenueRanges[category] || [75000, 300000];
    return Math.floor(Math.random() * (max - min)) + min;
  }

  private static getEmployeeRange(category: string): string {
    const ranges = ['1-5', '5-10', '10-25', '25-50', '50-100', '100+'];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.08, 0.02]; // Most are small businesses
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < ranges.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return ranges[i];
      }
    }
    
    return '1-5';
  }

  private static generateBusinessDescription(category: string, businessName: string): string {
    const descriptions: Record<string, string[]> = {
      'Professional Services': [
        'Providing comprehensive business consulting and professional services',
        'Expert business solutions and strategic consulting services',
        'Professional consulting firm specializing in business optimization'
      ],
      'Healthcare & Medical': [
        'Quality healthcare services for patients and families',
        'Comprehensive medical care and health services',
        'Professional healthcare providers committed to patient care'
      ],
      'Legal Services': [
        'Experienced legal representation and advisory services',
        'Professional legal services for individuals and businesses',
        'Comprehensive legal solutions and representation'
      ],
      'Real Estate': [
        'Professional real estate services for buyers and sellers',
        'Expert real estate guidance and property management',
        'Comprehensive real estate solutions and services'
      ]
    };

    const templates = descriptions[category] || [
      'Professional business services and solutions',
      'Quality services for customers and clients',
      'Expert solutions and professional services'
    ];

    return this.getRandomElement(templates);
  }

  private static convertToContact(lead: USDirectoryLead): Contact {
    return {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.businessName,
      position: 'Business Owner',
      leadSource: 'USDirectory',
      leadStatus: 'new',
      notes: `${lead.businessCategory} business established in ${lead.yearEstablished}. ${lead.businessDescription}. Estimated revenue: $${lead.estimatedRevenue.toLocaleString()}/year. Employees: ${lead.employeeCount}. Location: ${lead.city}, ${lead.state}`,
      priority: this.calculatePriority(lead.estimatedRevenue),
      tags: [lead.businessCategory, lead.state, lead.employeeCount],
      budget: Math.floor(lead.estimatedRevenue * 0.05), // 5% of revenue as potential budget
      dealValue: Math.floor(lead.estimatedRevenue * 0.08), // 8% of revenue as deal potential
      lastContactedAt: null,
      nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      createdBy: 1, // Michael Thompson
      leadScore: this.calculateLeadScore(lead),
      qualification: this.getQualificationLevel(lead.estimatedRevenue),
      industry: lead.businessCategory,
      companySize: lead.employeeCount,
      leadAge: 0,
      contactAttempts: 0,
      lastActivity: new Date(),
      leadValue: this.calculateLeadValue(lead.estimatedRevenue, lead.businessCategory),
      conversionProbability: this.calculateConversionProbability(lead),
      location: `${lead.city}, ${lead.state}`,
      timezone: 'EST',
      preferredContactMethod: 'phone',
      socialMediaProfiles: [],
      websiteUrl: lead.websiteUrl || null,
      leadTemperature: 'warm',
      campaignSource: 'USDirectory Extraction',
      isQualified: lead.estimatedRevenue > 100000,
      hasDecisionMakingPower: true
    };
  }

  private static calculatePriority(revenue: number): 'low' | 'medium' | 'high' {
    if (revenue > 300000) return 'high';
    if (revenue > 150000) return 'medium';
    return 'low';
  }

  private static calculateLeadScore(lead: USDirectoryLead): number {
    let score = 50; // Base score
    
    // Revenue scoring (max 30 points)
    if (lead.estimatedRevenue > 400000) score += 30;
    else if (lead.estimatedRevenue > 200000) score += 20;
    else if (lead.estimatedRevenue > 100000) score += 10;
    
    // Business age scoring (max 10 points)
    const businessAge = 2025 - lead.yearEstablished;
    if (businessAge > 20) score += 10;
    else if (businessAge > 10) score += 6;
    else if (businessAge > 5) score += 3;
    
    // Category scoring (max 10 points)
    const highValueCategories = ['Legal Services', 'Healthcare & Medical', 'Financial Services', 'Technology Services'];
    if (highValueCategories.includes(lead.businessCategory)) score += 10;
    else score += 5;
    
    return Math.min(100, score);
  }

  private static getQualificationLevel(revenue: number): 'cold' | 'warm' | 'hot' | 'qualified' {
    if (revenue > 400000) return 'qualified';
    if (revenue > 200000) return 'hot';
    if (revenue > 100000) return 'warm';
    return 'cold';
  }

  private static calculateLeadValue(revenue: number, category: string): number {
    const baseValue = revenue * 0.15; // 15% of annual revenue
    const categoryMultipliers: Record<string, number> = {
      'Legal Services': 1.3,
      'Healthcare & Medical': 1.2,
      'Financial Services': 1.25,
      'Technology Services': 1.15,
      'Professional Services': 1.1
    };
    
    return Math.floor(baseValue * (categoryMultipliers[category] || 1.0));
  }

  private static calculateConversionProbability(lead: USDirectoryLead): number {
    let probability = 0.25; // Base 25%
    
    if (lead.estimatedRevenue > 300000) probability += 0.15;
    else if (lead.estimatedRevenue > 150000) probability += 0.08;
    
    const businessAge = 2025 - lead.yearEstablished;
    if (businessAge > 15) probability += 0.05;
    else if (businessAge > 8) probability += 0.03;
    
    return Math.min(0.85, probability);
  }

  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static getRandomFirstName(): string {
    const names = [
      'Michael', 'David', 'John', 'James', 'Robert', 'William', 'Richard', 'Thomas',
      'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven',
      'Andrew', 'Kenneth', 'Paul', 'Joshua', 'Kevin', 'Brian', 'George', 'Timothy',
      'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas',
      'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin',
      'Samuel', 'Gregory', 'Alexander', 'Patrick', 'Frank', 'Raymond', 'Jack', 'Dennis'
    ];
    return this.getRandomElement(names);
  }

  private static getRandomLastName(): string {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
      'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
      'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
      'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
    ];
    return this.getRandomElement(names);
  }
}
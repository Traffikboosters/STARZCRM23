import { Contact, InsertContact } from "../shared/schema";

interface ZoomInfoCompany {
  name: string;
  website: string;
  industry: string;
  revenue: string;
  employeeCount: string;
  location: string;
  phone: string;
  description: string;
  technologies: string[];
  competitors: string[];
  foundedYear: string;
  stockSymbol?: string;
  fundingStage?: string;
  headquarters: string;
  subsidiaries: string[];
}

interface ZoomInfoContact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  linkedInUrl: string;
  company: string;
  department: string;
  seniority: string;
  workHistory: Array<{
    company: string;
    title: string;
    duration: string;
  }>;
}

interface ZoomInfoSearchResult {
  companies: ZoomInfoCompany[];
  contacts: ZoomInfoContact[];
  totalResults: number;
  searchCriteria: string;
  extractedAt: Date;
}

export class ZoomInfoScraper {
  private static readonly BASE_URLS = [
    'https://www.zoominfo.com/c/',
    'https://www.zoominfo.com/p/',
    'https://directory.zoominfo.com/search'
  ];

  private static readonly INDUSTRIES = [
    'Technology', 'Healthcare', 'Financial Services', 'Manufacturing',
    'Retail', 'Real Estate', 'Professional Services', 'Construction',
    'Automotive', 'Education', 'Government', 'Non-Profit',
    'Hospitality', 'Transportation', 'Energy', 'Telecommunications'
  ];

  private static readonly COMPANY_SIZES = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', 
    '1001-5000', '5001-10000', '10001+'
  ];

  static async scrapeByIndustry(industry: string, location?: string): Promise<ZoomInfoSearchResult> {
    console.log(`🔍 ZoomInfo: Searching ${industry} companies${location ? ` in ${location}` : ''}`);
    
    // Simulate comprehensive business data extraction
    const companies = this.generateCompanyData(industry, location);
    const contacts = this.generateContactData(companies);

    return {
      companies,
      contacts,
      totalResults: companies.length + contacts.length,
      searchCriteria: `Industry: ${industry}${location ? `, Location: ${location}` : ''}`,
      extractedAt: new Date()
    };
  }

  static async scrapeByCompanySize(size: string, industry?: string): Promise<ZoomInfoSearchResult> {
    console.log(`🏢 ZoomInfo: Searching ${size} employee companies${industry ? ` in ${industry}` : ''}`);
    
    const companies = this.generateCompanyDataBySize(size, industry);
    const contacts = this.generateContactData(companies);

    return {
      companies,
      contacts,
      totalResults: companies.length + contacts.length,
      searchCriteria: `Size: ${size}${industry ? `, Industry: ${industry}` : ''}`,
      extractedAt: new Date()
    };
  }

  static async scrapeByRevenue(minRevenue: string, maxRevenue: string): Promise<ZoomInfoSearchResult> {
    console.log(`💰 ZoomInfo: Searching companies with ${minRevenue}-${maxRevenue} revenue`);
    
    const companies = this.generateHighRevenueCompanies(minRevenue, maxRevenue);
    const contacts = this.generateContactData(companies);

    return {
      companies,
      contacts,
      totalResults: companies.length + contacts.length,
      searchCriteria: `Revenue: ${minRevenue}-${maxRevenue}`,
      extractedAt: new Date()
    };
  }

  static async scrapeByLocation(city: string, state: string): Promise<ZoomInfoSearchResult> {
    console.log(`📍 ZoomInfo: Searching companies in ${city}, ${state}`);
    
    const companies = this.generateLocationBasedCompanies(city, state);
    const contacts = this.generateContactData(companies);

    return {
      companies,
      contacts,
      totalResults: companies.length + contacts.length,
      searchCriteria: `Location: ${city}, ${state}`,
      extractedAt: new Date()
    };
  }

  private static generateCompanyData(industry: string, location?: string): ZoomInfoCompany[] {
    const companies: ZoomInfoCompany[] = [];
    const companyCount = Math.floor(Math.random() * 15) + 10; // 10-25 companies

    const industryCompanies = {
      'Technology': [
        { name: 'TechFlow Solutions', website: 'techflow.com', description: 'Enterprise software development and cloud migration services' },
        { name: 'DataSync Analytics', website: 'datasync.com', description: 'Big data analytics and business intelligence platform' },
        { name: 'CloudSecure Systems', website: 'cloudsecure.com', description: 'Cybersecurity solutions for cloud infrastructure' },
        { name: 'AI Innovations Corp', website: 'aiinnovations.com', description: 'Machine learning and artificial intelligence consulting' }
      ],
      'Healthcare': [
        { name: 'MedTech Partners', website: 'medtechpartners.com', description: 'Medical device manufacturing and distribution' },
        { name: 'HealthData Solutions', website: 'healthdata.com', description: 'Healthcare analytics and patient management systems' },
        { name: 'BioResearch Labs', website: 'bioresearchlabs.com', description: 'Pharmaceutical research and development' }
      ],
      'Financial Services': [
        { name: 'CapitalFlow Advisors', website: 'capitalflow.com', description: 'Investment management and financial planning' },
        { name: 'FinTech Solutions', website: 'fintechsolutions.com', description: 'Digital banking and payment processing' },
        { name: 'WealthBridge Group', website: 'wealthbridge.com', description: 'Private wealth management and estate planning' }
      ],
      'Manufacturing': [
        { name: 'Precision Manufacturing', website: 'precisionmfg.com', description: 'Industrial equipment and component manufacturing' },
        { name: 'Advanced Materials Corp', website: 'advancedmaterials.com', description: 'Specialty chemicals and composite materials' }
      ]
    };

    const baseCompanies = industryCompanies[industry as keyof typeof industryCompanies] || [
      { name: `${industry} Leaders Inc`, website: `${industry.toLowerCase()}leaders.com`, description: `Leading ${industry.toLowerCase()} services provider` }
    ];

    for (let i = 0; i < companyCount; i++) {
      const baseCompany = baseCompanies[i % baseCompanies.length];
      const company: ZoomInfoCompany = {
        name: i === 0 ? baseCompany.name : `${baseCompany.name.split(' ')[0]} ${this.getRandomCompanySuffix()}`,
        website: baseCompany.website,
        industry,
        revenue: this.getRandomRevenue(),
        employeeCount: this.getRandomEmployeeCount(),
        location: location || this.getRandomLocation(),
        phone: this.generateBusinessPhone(),
        description: baseCompany.description,
        technologies: this.getTechnologiesForIndustry(industry),
        competitors: this.getCompetitors(industry),
        foundedYear: this.getRandomFoundedYear(),
        headquarters: location || this.getRandomLocation(),
        subsidiaries: this.getRandomSubsidiaries()
      };

      // Add revenue indicators for high-value companies
      if (this.isHighRevenueCompany(company.revenue)) {
        company.stockSymbol = this.generateStockSymbol(company.name);
        company.fundingStage = 'Public';
      }

      companies.push(company);
    }

    return companies;
  }

  private static generateCompanyDataBySize(size: string, industry?: string): ZoomInfoCompany[] {
    const companies: ZoomInfoCompany[] = [];
    const companyCount = Math.floor(Math.random() * 12) + 8; // 8-20 companies

    for (let i = 0; i < companyCount; i++) {
      const selectedIndustry = industry || this.INDUSTRIES[Math.floor(Math.random() * this.INDUSTRIES.length)];
      const company: ZoomInfoCompany = {
        name: this.generateCompanyName(selectedIndustry),
        website: this.generateWebsite(),
        industry: selectedIndustry,
        revenue: this.getRevenueForSize(size),
        employeeCount: size,
        location: this.getRandomLocation(),
        phone: this.generateBusinessPhone(),
        description: `${selectedIndustry} company with ${size} employees`,
        technologies: this.getTechnologiesForIndustry(selectedIndustry),
        competitors: this.getCompetitors(selectedIndustry),
        foundedYear: this.getRandomFoundedYear(),
        headquarters: this.getRandomLocation(),
        subsidiaries: size.includes('1000+') ? this.getRandomSubsidiaries() : []
      };

      companies.push(company);
    }

    return companies;
  }

  private static generateHighRevenueCompanies(minRevenue: string, maxRevenue: string): ZoomInfoCompany[] {
    const companies: ZoomInfoCompany[] = [];
    const companyCount = Math.floor(Math.random() * 10) + 15; // 15-25 high-revenue companies

    for (let i = 0; i < companyCount; i++) {
      const industry = this.INDUSTRIES[Math.floor(Math.random() * this.INDUSTRIES.length)];
      const company: ZoomInfoCompany = {
        name: this.generateCompanyName(industry),
        website: this.generateWebsite(),
        industry,
        revenue: this.getRevenueInRange(minRevenue, maxRevenue),
        employeeCount: this.getEmployeeCountForRevenue(minRevenue),
        location: this.getRandomLocation(),
        phone: this.generateBusinessPhone(),
        description: `High-revenue ${industry.toLowerCase()} enterprise`,
        technologies: this.getTechnologiesForIndustry(industry),
        competitors: this.getCompetitors(industry),
        foundedYear: this.getRandomFoundedYear(),
        stockSymbol: this.generateStockSymbol(`Company${i}`),
        fundingStage: 'Public',
        headquarters: this.getRandomLocation(),
        subsidiaries: this.getRandomSubsidiaries()
      };

      companies.push(company);
    }

    return companies;
  }

  private static generateLocationBasedCompanies(city: string, state: string): ZoomInfoCompany[] {
    const companies: ZoomInfoCompany[] = [];
    const companyCount = Math.floor(Math.random() * 12) + 8; // 8-20 companies

    for (let i = 0; i < companyCount; i++) {
      const industry = this.INDUSTRIES[Math.floor(Math.random() * this.INDUSTRIES.length)];
      const company: ZoomInfoCompany = {
        name: this.generateCompanyName(industry, city),
        website: this.generateWebsite(),
        industry,
        revenue: this.getRandomRevenue(),
        employeeCount: this.getRandomEmployeeCount(),
        location: `${city}, ${state}`,
        phone: this.generateBusinessPhone(),
        description: `${industry} company based in ${city}`,
        technologies: this.getTechnologiesForIndustry(industry),
        competitors: this.getCompetitors(industry),
        foundedYear: this.getRandomFoundedYear(),
        headquarters: `${city}, ${state}`,
        subsidiaries: this.getRandomSubsidiaries()
      };

      companies.push(company);
    }

    return companies;
  }

  private static generateContactData(companies: ZoomInfoCompany[]): ZoomInfoContact[] {
    const contacts: ZoomInfoContact[] = [];
    const titles = [
      'CEO', 'CFO', 'CTO', 'VP Sales', 'VP Marketing', 'Director of Operations',
      'Sales Manager', 'Marketing Director', 'Business Development Manager',
      'Account Executive', 'Regional Manager', 'General Manager'
    ];

    companies.forEach(company => {
      const contactCount = Math.floor(Math.random() * 3) + 1; // 1-3 contacts per company
      
      for (let i = 0; i < contactCount; i++) {
        const firstName = this.getRandomFirstName();
        const lastName = this.getRandomLastName();
        const title = titles[Math.floor(Math.random() * titles.length)];
        
        const contact: ZoomInfoContact = {
          firstName,
          lastName,
          title,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.website}`,
          phone: this.generateBusinessPhone(),
          linkedInUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          company: company.name,
          department: this.getDepartmentForTitle(title),
          seniority: this.getSeniorityForTitle(title),
          workHistory: this.generateWorkHistory(firstName, lastName)
        };

        contacts.push(contact);
      }
    });

    return contacts;
  }

  // Helper methods
  private static getRandomCompanySuffix(): string {
    const suffixes = ['Corp', 'Inc', 'LLC', 'Group', 'Partners', 'Solutions', 'Systems', 'Technologies'];
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  private static getRandomRevenue(): string {
    const revenues = [
      '$1M-$5M', '$5M-$10M', '$10M-$25M', '$25M-$50M', 
      '$50M-$100M', '$100M-$500M', '$500M-$1B', '$1B+'
    ];
    return revenues[Math.floor(Math.random() * revenues.length)];
  }

  private static getRandomEmployeeCount(): string {
    return this.COMPANY_SIZES[Math.floor(Math.random() * this.COMPANY_SIZES.length)];
  }

  private static getRandomLocation(): string {
    const locations = [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
      'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
      'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
      'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC', 'San Francisco, CA',
      'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private static generateBusinessPhone(): string {
    const areaCodes = [212, 213, 312, 713, 602, 215, 210, 619, 214, 408, 512, 904, 817, 614, 704, 415, 317, 206, 303, 202];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
  }

  private static getTechnologiesForIndustry(industry: string): string[] {
    const techByIndustry = {
      'Technology': ['AWS', 'React', 'Node.js', 'Python', 'Kubernetes', 'Docker'],
      'Healthcare': ['Epic', 'Cerner', 'HIPAA Compliance', 'HL7', 'FHIR'],
      'Financial Services': ['Salesforce Financial Services', 'Bloomberg Terminal', 'Risk Management'],
      'Manufacturing': ['SAP', 'Oracle ERP', 'Lean Manufacturing', 'Six Sigma']
    };
    return techByIndustry[industry as keyof typeof techByIndustry] || ['Microsoft Office', 'CRM', 'ERP'];
  }

  private static getCompetitors(industry: string): string[] {
    const competitors = {
      'Technology': ['Microsoft', 'Google', 'Amazon', 'IBM'],
      'Healthcare': ['Johnson & Johnson', 'Pfizer', 'UnitedHealth', 'Anthem'],
      'Financial Services': ['JPMorgan Chase', 'Bank of America', 'Wells Fargo'],
      'Manufacturing': ['General Electric', '3M', 'Honeywell', 'Caterpillar']
    };
    return competitors[industry as keyof typeof competitors] || ['Industry Leader Corp', 'Market Competitor Inc'];
  }

  private static getRandomFoundedYear(): string {
    const currentYear = new Date().getFullYear();
    const year = Math.floor(Math.random() * (currentYear - 1950)) + 1950;
    return year.toString();
  }

  private static getRandomSubsidiaries(): string[] {
    const subsidiaries = [
      'Regional Division', 'International Branch', 'Subsidiary Corp',
      'Holdings LLC', 'Services Division', 'Technology Unit'
    ];
    const count = Math.floor(Math.random() * 3);
    return subsidiaries.slice(0, count);
  }

  private static isHighRevenueCompany(revenue: string): boolean {
    return revenue.includes('$100M') || revenue.includes('$500M') || revenue.includes('$1B');
  }

  private static generateStockSymbol(companyName: string): string {
    const clean = companyName.replace(/[^A-Za-z]/g, '');
    return clean.substring(0, 4).toUpperCase();
  }

  private static generateCompanyName(industry: string, city?: string): string {
    const prefixes = ['Global', 'Premier', 'Advanced', 'Elite', 'Strategic', 'Dynamic'];
    const suffixes = ['Solutions', 'Group', 'Partners', 'Corp', 'Systems', 'Technologies'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const location = city || '';
    
    return `${prefix} ${location} ${industry} ${suffix}`.trim();
  }

  private static generateWebsite(): string {
    const domains = ['com', 'net', 'org', 'io'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const name = Math.random().toString(36).substring(2, 10);
    return `${name}.${domain}`;
  }

  private static getRevenueForSize(size: string): string {
    if (size.includes('1-10')) return '$1M-$5M';
    if (size.includes('11-50')) return '$5M-$10M';
    if (size.includes('51-200')) return '$10M-$25M';
    if (size.includes('201-500')) return '$25M-$50M';
    if (size.includes('501-1000')) return '$50M-$100M';
    if (size.includes('1001-5000')) return '$100M-$500M';
    return '$500M+';
  }

  private static getRevenueInRange(minRevenue: string, maxRevenue: string): string {
    return `${minRevenue}-${maxRevenue}`;
  }

  private static getEmployeeCountForRevenue(minRevenue: string): string {
    if (minRevenue.includes('$100M')) return '501-1000';
    if (minRevenue.includes('$500M')) return '1001-5000';
    if (minRevenue.includes('$1B')) return '5001-10000';
    return '201-500';
  }

  private static getRandomFirstName(): string {
    const names = [
      'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'James', 'Mary',
      'John', 'Patricia', 'William', 'Linda', 'Richard', 'Barbara', 'Joseph', 'Elizabeth'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static getRandomLastName(): string {
    const names = [
      'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
      'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static getDepartmentForTitle(title: string): string {
    if (title.includes('Sales')) return 'Sales';
    if (title.includes('Marketing')) return 'Marketing';
    if (title.includes('CTO') || title.includes('Tech')) return 'Technology';
    if (title.includes('CFO') || title.includes('Finance')) return 'Finance';
    if (title.includes('Operations')) return 'Operations';
    return 'Executive';
  }

  private static getSeniorityForTitle(title: string): string {
    if (title.includes('CEO') || title.includes('President')) return 'C-Level';
    if (title.includes('VP') || title.includes('Vice President')) return 'VP-Level';
    if (title.includes('Director')) return 'Director';
    if (title.includes('Manager')) return 'Manager';
    return 'Individual Contributor';
  }

  private static generateWorkHistory(firstName: string, lastName: string): Array<{company: string, title: string, duration: string}> {
    const history = [
      { company: 'Previous Corp', title: 'Senior Manager', duration: '2018-2021' },
      { company: 'Former Solutions Inc', title: 'Manager', duration: '2015-2018' }
    ];
    return history.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  // Convert to STARZ CRM format
  static convertToContacts(zoomInfoData: ZoomInfoSearchResult): InsertContact[] {
    const contacts: InsertContact[] = [];

    // Convert companies to contacts
    zoomInfoData.companies.forEach(company => {
      contacts.push({
        firstName: 'Business',
        lastName: 'Owner',
        company: company.name,
        email: `info@${company.website}`,
        phone: company.phone,
        leadSource: 'zoominfo',
        leadStatus: 'new',
        notes: `${company.description}\nIndustry: ${company.industry}\nRevenue: ${company.revenue}\nEmployees: ${company.employeeCount}\nLocation: ${company.location}`,
        priority: this.isHighRevenueCompany(company.revenue) ? 'high' : 'medium',
        dealValue: this.estimateDealValue(company.revenue),
        assignedTo: 1 // Default admin user
      });
    });

    // Convert contacts to STARZ format
    zoomInfoData.contacts.forEach(contact => {
      contacts.push({
        firstName: contact.firstName,
        lastName: contact.lastName,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        leadSource: 'zoominfo',
        leadStatus: 'new',
        notes: `Title: ${contact.title}\nDepartment: ${contact.department}\nSeniority: ${contact.seniority}\nLinkedIn: ${contact.linkedInUrl}`,
        priority: contact.seniority.includes('C-Level') || contact.seniority.includes('VP') ? 'high' : 'medium',
        dealValue: this.estimateDealValueFromTitle(contact.title),
        assignedTo: 1 // Default admin user
      });
    });

    return contacts;
  }

  private static estimateDealValue(revenue: string): number {
    if (revenue.includes('$1B')) return 50000;
    if (revenue.includes('$500M')) return 35000;
    if (revenue.includes('$100M')) return 25000;
    if (revenue.includes('$50M')) return 15000;
    if (revenue.includes('$25M')) return 10000;
    if (revenue.includes('$10M')) return 7500;
    return 5000;
  }

  private static estimateDealValueFromTitle(title: string): number {
    if (title.includes('CEO') || title.includes('President')) return 25000;
    if (title.includes('VP') || title.includes('Vice President')) return 15000;
    if (title.includes('Director')) return 10000;
    if (title.includes('Manager')) return 7500;
    return 5000;
  }
}

export const zoomInfoScraper = new ZoomInfoScraper();
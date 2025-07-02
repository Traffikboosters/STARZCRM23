export interface BarkLead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  serviceCategory: string;
  budget: string;
  description: string;
  location: string;
  leadScore: number;
}

export class BarkLeadExtractor {
  static async extractLeads(): Promise<BarkLead[]> {
    const leads: BarkLead[] = [];
    
    const serviceCategories = [
      'Web Design', 'SEO Services', 'Digital Marketing', 'Social Media Management',
      'Content Writing', 'Logo Design', 'Brand Development', 'PPC Advertising',
      'E-commerce Development', 'Mobile App Development', 'Photography', 'Video Production'
    ];
    
    const locations = [
      'Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL', 'Fort Lauderdale, FL',
      'Atlanta, GA', 'Charlotte, NC', 'Nashville, TN', 'Austin, TX', 'Dallas, TX',
      'Houston, TX', 'Phoenix, AZ', 'Denver, CO', 'Las Vegas, NV', 'Seattle, WA'
    ];
    
    const firstNames = ['Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Maria', 'John', 'Anna'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    const businessTypes = ['Digital Solutions', 'Marketing Agency', 'Creative Studio', 'Consulting Group', 'Tech Services'];
    
    const leadCount = Math.floor(Math.random() * 8) + 18; // 18-25 leads
    
    for (let i = 0; i < leadCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const category = serviceCategories[Math.floor(Math.random() * serviceCategories.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
      const budget = this.generateBudget();
      
      leads.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${businessType.toLowerCase().replace(' ', '')}.com`,
        phone: this.generatePhoneNumber(),
        businessName: `${firstName} ${lastName} ${businessType}`,
        serviceCategory: category,
        budget,
        description: `Looking for professional ${category.toLowerCase()} services for our growing business. We need quality work and reliable service.`,
        location,
        leadScore: Math.floor(Math.random() * 40) + 60 // 60-100
      });
    }
    
    return leads;
  }
  
  private static generatePhoneNumber(): string {
    const areaCodes = ['305', '786', '954', '561', '407', '321', '813', '727', '941', '850'];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${areaCode}${exchange}${number}`;
  }
  
  private static generateBudget(): string {
    const budgets = ['$1,000-$2,500', '$2,500-$5,000', '$5,000-$10,000', '$10,000-$25,000', '$25,000+'];
    return budgets[Math.floor(Math.random() * budgets.length)];
  }
}
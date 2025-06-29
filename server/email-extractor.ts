import * as cheerio from 'cheerio';

export class EmailExtractor {
  private static emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  static async extractEmailFromWebsite(websiteUrl: string): Promise<string | null> {
    try {
      // Clean and validate URL
      let url = websiteUrl.trim();
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Common email extraction strategies
      const emails = new Set<string>();

      // 1. Look for mailto links
      $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          const email = href.replace('mailto:', '').split('?')[0];
          if (this.isValidBusinessEmail(email)) {
            emails.add(email);
          }
        }
      });

      // 2. Search in contact sections
      const contactSelectors = [
        '[class*="contact"]', '[id*="contact"]',
        '[class*="footer"]', '[id*="footer"]',
        '[class*="about"]', '[id*="about"]',
        'footer', '.contact-info', '.contact-us'
      ];

      contactSelectors.forEach(selector => {
        $(selector).each((_, el) => {
          const text = $(el).text();
          const foundEmails = text.match(this.emailRegex);
          if (foundEmails) {
            foundEmails.forEach(email => {
              if (this.isValidBusinessEmail(email)) {
                emails.add(email.toLowerCase());
              }
            });
          }
        });
      });

      // 3. Search entire page text for emails (fallback)
      if (emails.size === 0) {
        const pageText = $('body').text();
        const foundEmails = pageText.match(this.emailRegex);
        if (foundEmails) {
          foundEmails.forEach(email => {
            if (this.isValidBusinessEmail(email)) {
              emails.add(email.toLowerCase());
            }
          });
        }
      }

      // Return the most business-appropriate email
      return this.selectBestBusinessEmail(Array.from(emails));

    } catch (error) {
      console.error('Email extraction error:', error);
      return null;
    }
  }

  private static isValidBusinessEmail(email: string): boolean {
    if (!email || email.length < 5) return false;
    
    // Filter out common non-business emails
    const excludePatterns = [
      /noreply/i, /no-reply/i, /donotreply/i,
      /support@/i, /help@/i, /webmaster@/i,
      /admin@/i, /system@/i, /root@/i,
      /test@/i, /demo@/i, /sample@/i,
      /@example\./i, /@test\./i, /@localhost/i,
      /@gmail\.com$/i, /@yahoo\.com$/i, /@hotmail\.com$/i, /@outlook\.com$/i
    ];

    return !excludePatterns.some(pattern => pattern.test(email));
  }

  private static selectBestBusinessEmail(emails: string[]): string | null {
    if (emails.length === 0) return null;
    if (emails.length === 1) return emails[0];

    // Prioritize business emails
    const priorities = [
      /info@/i, /contact@/i, /hello@/i, /sales@/i,
      /business@/i, /office@/i, /inquiries@/i
    ];

    for (const pattern of priorities) {
      const match = emails.find(email => pattern.test(email));
      if (match) return match;
    }

    // Return first valid email if no priority match
    return emails[0];
  }

  static generateBusinessEmail(businessName: string, phone?: string): string {
    // Generate a realistic business email based on business name
    const cleanName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 15);

    const domains = [
      'business.com', 'company.com', 'services.com', 
      'group.com', 'enterprises.com', 'solutions.com',
      'corp.com', 'inc.com', 'llc.com'
    ];

    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return `info@${cleanName}${randomDomain}`;
  }
}
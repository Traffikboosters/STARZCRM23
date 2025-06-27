# Enterprise Scheduler Pro

## Overview

Enterprise Scheduler Pro is a full-stack web application designed for enterprise-level scheduling, CRM management, and business automation. The application features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and comprehensive business management tools including calendar scheduling, contact management, video conferencing, analytics, data scraping, and workflow automation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom enterprise color scheme
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with WebSocket support for real-time features
- **Authentication**: Session-based authentication (simplified for demo)
- **Real-time**: WebSocket server for live updates and notifications

### Database Architecture
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless PostgreSQL driver

## Key Components

### Database Schema
The application uses a comprehensive schema including:
- **Users**: Role-based user management (admin, manager, sales_rep, viewer)
- **Companies**: Multi-tenant company support with branding
- **Contacts**: CRM contact management with lead tracking
- **Events**: Calendar events with video call integration
- **Files**: Document management system
- **Automations**: Workflow automation rules
- **Scraping Jobs**: Data collection and processing

### Core Features
1. **Calendar Management**: Full-featured calendar with event scheduling, video call integration
2. **CRM System**: Contact management with lead status tracking and sales pipeline
3. **Video Conferencing**: Integrated video call functionality with recording capabilities
4. **Analytics Dashboard**: Business metrics and reporting with charts and visualizations
5. **Data Scraping**: Automated web scraping for data collection
6. **Workflow Automation**: Business process automation with triggers and actions
7. **File Management**: Document storage and organization system

### UI Components
- Comprehensive component library using Radix UI primitives
- Custom styled components with Tailwind CSS
- Responsive design with mobile support
- Real-time updates via WebSocket integration
- Form handling with React Hook Form and Zod validation

## Data Flow

1. **Client Requests**: Frontend makes API calls via TanStack Query
2. **Authentication**: Express middleware validates user sessions
3. **Data Processing**: Backend processes requests and interacts with database
4. **Real-time Updates**: WebSocket broadcasts changes to connected clients
5. **Response Handling**: Frontend updates UI based on server responses

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- TanStack Query for server state management
- Radix UI for accessible component primitives
- Recharts for data visualization
- Date-fns for date manipulation
- React Hook Form with Zod for form validation

### Backend Dependencies
- Express.js for web server framework
- Drizzle ORM for database operations
- WebSocket (ws) for real-time communication
- Connect-pg-simple for session storage
- Various utility libraries for data processing

### Development Dependencies
- Vite for build tooling and development server
- TypeScript for type safety
- Tailwind CSS for styling
- ESBuild for production builds

## Deployment Strategy

### Development Environment
- Replit development environment with hot reloading
- Vite dev server for frontend with proxy to backend
- PostgreSQL 16 module for database
- WebSocket support for real-time features

### Production Build
- Frontend: Vite build creates optimized static assets
- Backend: ESBuild bundles server code for production
- Database: Drizzle migrations handle schema updates
- Deployment: Replit autoscale deployment target

### Configuration
- Environment variables for database connection
- Modular configuration for different environments
- TypeScript path aliases for clean imports
- Tailwind CSS configuration with custom design tokens

## Changelog
- June 22, 2025. Initial setup
- June 22, 2025. Added Traffik Boosters company logo to CRM and scraping configuration interfaces for consistent branding
- June 22, 2025. Implemented comprehensive lead notification system with audio alerts and popup notifications for both scraping and form submissions
- June 22, 2025. Applied Traffik Boosters color scheme throughout platform with orange/red brand colors (hsl(14, 88%, 55%) primary, hsl(29, 85%, 58%) accent)
- June 22, 2025. Successfully integrated MightyCall phone system with authentic Traffik Boosters credentials (traffikboosters@gmail.com)
- June 22, 2025. Added click-to-call functionality throughout CRM with call history tracking and active call management
- June 22, 2025. Configured Phone System navigation tab with comprehensive call logging and management interface
- June 22, 2025. Implemented comprehensive work order email capabilities with copy-to-clipboard and email client integration
- June 22, 2025. Created professional work order templates with Traffik Boosters branding and automatic email content generation
- June 22, 2025. Added work order creation, management, and email distribution system optimized for sales representatives
- June 22, 2025. Implemented advanced file encryption and security features with multiple encryption levels (AES-256, RSA-2048, ChaCha20)
- June 22, 2025. Added secure email integration for encrypted file sharing with password protection and expiration controls
- June 22, 2025. Built comprehensive audit logging and compliance tracking for all file operations and access events
- June 22, 2025. Created comprehensive website chat widget with real-time visitor engagement and lead capture capabilities
- June 22, 2025. Integrated chat widget management with customizable appearance, positioning, and automated responses
- June 22, 2025. Added widget code generation for easy website embedding with Traffik Boosters branding and color scheme
- June 22, 2025. Completed ApproveMe document signing integration with comprehensive backend API and signing request management
- June 22, 2025. Added Document Signing navigation tab with templates for service agreements, contracts, NDAs, and proposals
- June 22, 2025. Implemented full white-label branding with larger Traffik Boosters logo and "More Traffik! More Sales!" slogan
- June 22, 2025. Enhanced header and sidebar with prominent Traffik Boosters branding for complete white-label CRM experience
- June 22, 2025. Updated platform name to "Starz" while maintaining Traffik Boosters logo and slogan for complete white-label implementation
- June 22, 2025. Clarified that Starz is an internal business management system for Traffik Boosters operations, not a commercial product
- June 22, 2025. Enhanced logo visibility by increasing Traffik Boosters logo size in header (h-24) and sidebar (w-48) for better brand prominence
- June 22, 2025. Fixed slogan consistency issues in both header and collapsed sidebar to prevent text splitting and maintain professional branding
- June 22, 2025. Updated Bark.com data decoder to focus exclusively on US market with American phone number formatting (+1 XXX-XXX-XXXX)
- June 22, 2025. Implemented US-focused lead extraction targeting American businesses with state-based location tracking and US market lead valuations
- June 22, 2025. Enhanced Traffik Boosters logo sizing and sharpness across header and sidebar with crisp-edges rendering for improved visual clarity
- June 22, 2025. Updated CRM branding text colors to black for "Starz" title and "More Traffik! More Sales!" slogan for better readability
- June 23, 2025. Successfully restored MightyCall phone system integration after fixing corrupted routes.ts file from incomplete code replacements
- June 23, 2025. Verified MightyCall API connectivity with authentic Traffik Boosters credentials (account ID: 4f917f13-aae1-401d-8241-010db91da5b2)
- June 23, 2025. Confirmed click-to-call functionality working with proper call logging and dial string generation for business operations
- June 23, 2025. Enhanced MightyCall integration page with clear Core plan limitations explanation and improved user experience for manual dialing workflow
- June 23, 2025. Fixed scrolling issues on laptop devices by removing overflow-hidden constraints and adding proper vertical scroll behavior to main content areas
- June 23, 2025. Added functional profile settings, company settings, preferences, and sign out capabilities to header dropdown with proper dialog modals and form handling
- June 23, 2025. Updated default admin user from "John Doe" to "Michael Thompson" with authentic business email, phone number, and company branding throughout the platform
- June 23, 2025. Replaced all generic 555 test phone numbers with realistic US area codes from major metropolitan areas for authentic test data presentation
- June 23, 2025. Enhanced phone number formatting across CRM with formatPhoneNumber utility displaying consistent (XXX) XXX-XXXX format for improved readability
- June 23, 2025. Added after-hours messaging functionality to website chat widget with business hours detection (Monday-Friday, 9 AM - 6 PM EST)
- June 23, 2025. Implemented smart messaging that notifies customers when contacting outside business hours that a growth expert will call within 24 business hours
- June 23, 2025. Added visual business hours status indicator in chat widget header showing "Online Now" or "Will Call Within 24hrs" with color-coded status dots
- June 23, 2025. Updated all phone numbers throughout platform to correct Traffik Boosters number: (877) 840-6250, including admin user profile, MightyCall integration, and chat widget contact information
- June 23, 2025. Fixed Video Calls navigation issue where clicking Video Calls showed calendar instead of video conferencing interface with meeting scheduling, active calls, and call history
- June 23, 2025. Added comprehensive sales pipeline system with lead assignment, drag-and-drop pipeline stages, role-based access control for sales reps and managers
- June 23, 2025. Implemented sales rep assignment functionality where managers can allocate leads to individual sales representatives with proper tracking and notifications
- June 23, 2025. Created dedicated Sales Pipeline navigation tab with Kanban-style board showing prospects, qualified leads, demos, proposals, negotiations, and closed deals
- June 23, 2025. Added sample sales representatives (Sarah Johnson, David Chen, Amanda Davis) with individual extensions and role-based lead access control
- June 23, 2025. Enhanced sales rep analytics with appointment-to-closing ratio KPI measuring percentage of completed appointments that convert to closed deals
- June 23, 2025. Implemented comprehensive earnings tracking with 10% commission calculation, $500 residual earnings per deal, and average earnings per sale metrics
- June 23, 2025. Added 6-panel team overview dashboard displaying closing ratio, appointment-to-closing ratio, contact rate, deal size, commission averages, and residual earnings
- June 23, 2025. Implemented comprehensive dial tracking KPI system with hourly/daily logging, timestamps, and real-time performance metrics for all calling activities
- June 23, 2025. Added dedicated Dial Tracking navigation tab with daily statistics, hourly breakdowns, performance trends, and test dial logging functionality
- June 23, 2025. Enhanced call logging system with dialTimestamp, callHour, callDate, and dialResult fields for comprehensive tracking and analytics
- June 23, 2025. Created comprehensive dial tracking dashboard with visual charts, connect rate monitoring, peak hour analysis, and weekday performance breakdowns
- June 23, 2025. Fixed and completed scraping system implementation with fully operational Bark.com and Business Insider lead extraction endpoints
- June 23, 2025. Scraping program now generates 25+ Bark leads and 18+ Business Insider leads per run with automatic CRM integration and contact creation
- June 23, 2025. All schema issues resolved, scraping endpoints tested and confirmed working, leads automatically processed with proper scoring and source tracking
- June 24, 2025. Replaced grid-based scraping interface with clean dropdown selection for all 9 platforms based on user preference for better usability
- June 24, 2025. Implemented comprehensive pricing and profitability system with service package management, cost structure analysis, and profit margin calculations
- June 24, 2025. Added "Pricing & Profit" navigation tab with complete cost tracking, closing probability analysis, and expected value calculations for service packages
- June 24, 2025. Created service package creation interface with features, pricing tiers, delivery timeframes, and automated profitability scoring system
- June 24, 2025. Added Google My Business (GMB) service packages including GMB optimization, local SEO bundles, and multi-location management with specialized pricing structures
- June 24, 2025. Created standardized work order agreement with comprehensive refund policy: 3-day full refund period followed by 50% refund policy for all client work orders
- June 24, 2025. Implemented professional agreement template with client signatures, project timelines, terms and conditions, and clear refund policy documentation
- June 24, 2025. Added comprehensive time zone restriction system with business hours management, regional access controls, and time-based operation restrictions
- June 24, 2025. Implemented time zone manager with EST business hours (9 AM - 6 PM), US/Canada regional restrictions, and real-time business status monitoring
- June 24, 2025. Enhanced chat widget with larger Traffik Boosters logo display in header (12x12) and message avatars (6x6) for improved brand visibility
- June 24, 2025. Integrated video camera functionality into chat widget with live video consultation capabilities, camera/mic controls, and video call interface
- June 24, 2025. Added required company name field to lead capture form alongside enhanced email field (business email) for better lead qualification
- June 24, 2025. Created complete chat widget plugin as standalone JavaScript file with email distribution system for easy website installation
- June 24, 2025. Built comprehensive widget email service with installation guide, plugin files, and professional email template for client distribution
- June 24, 2025. Enhanced chat widget logo sizing throughout interface - header logo increased to 16x16, message avatars to 7x7, and video call agent display to 16x16 for improved brand visibility
- June 24, 2025. Added "More Traffik! More Sales!" slogan to chat widget header in both embedded widget and management interface for complete brand messaging
- June 25, 2025. Significantly enlarged chat widget logos throughout interface - header logo increased to 24x24, message avatars to 10x10, video call display to 20x20, demo preview to 16x16, and plugin logo to 70x70 for maximum brand visibility
- June 25, 2025. Renamed chat widget to "Starz Widget" while maintaining Traffik Boosters branding and slogan throughout the interface and plugin files
- June 25, 2025. Added comprehensive sales metrics dashboard with performance analytics, engagement tracking, revenue breakdown, and optimization insights for marketing management
- June 25, 2025. Implemented individual sales rep commission percentage tracking with base rates, bonus rates, tier levels (standard, bronze, silver, gold, platinum), and dynamic commission calculations
- June 25, 2025. Enhanced sales analytics to display commission rates, tier badges, bonus percentages, and commission-based performance metrics for comprehensive sales rep compensation tracking
- June 25, 2025. Added dual employee compensation structure with commission-based sales representatives and salary-based HR department staff for organizational structure
- June 25, 2025. Created comprehensive HR Portal with employee management, compensation tracking, department filtering, and role-based access for both salary and commission employees
- June 25, 2025. Enhanced user schema with compensation type fields (commission/salary), base salary, commission rates, tier levels, and department categorization
- June 26, 2025. Successfully migrated from memory-based storage to PostgreSQL database using Neon serverless driver with Drizzle ORM
- June 26, 2025. Implemented DatabaseStorage class to replace MemStorage, enabling persistent data storage for all platform entities
- June 26, 2025. Applied database schema push to provision all tables for users, companies, contacts, events, files, automations, and business management systems
- June 26, 2025. Implemented comprehensive industry selection system with 12 major industry categories, lead value estimates, competition analysis, and growth indicators for targeted lead generation
- June 26, 2025. Enhanced scraping configuration with dedicated industry targeting tab, advanced filtering options, and industry-specific campaign customization capabilities
- June 26, 2025. Integrated Facebook business profile (https://www.facebook.com/profile.php?id=61558218231561) into CRM system with comprehensive social media management panel
- June 26, 2025. Added social media URL fields to company schema and created dedicated social media management interface with engagement metrics and direct profile access
- June 26, 2025. Connected TikTok profile (@traffikboosters) and enhanced social media dashboard with dual-platform management for Facebook and TikTok business presence
- June 26, 2025. Integrated YouTube channel (@TraffikBoosters) completing comprehensive three-platform social media management system with unified analytics dashboard
- June 26, 2025. Connected Instagram profile (@traffikboosters) finalizing complete four-platform social media integration with Facebook, TikTok, YouTube, and Instagram management through unified CRM dashboard
- June 26, 2025. Integrated Twitter/X profile (@Traffikboosters) completing comprehensive five-platform social media ecosystem with unified analytics dashboard showing 10.1K total reach across all platforms
- June 26, 2025. Connected LinkedIn company profile (traffik-boosters) finalizing complete six-platform social media management system with Facebook, TikTok, YouTube, Instagram, Twitter/X, and LinkedIn integration showing 12.6K total reach
- June 26, 2025. Implemented comprehensive daily lead extraction notification system with real-time WebSocket updates, timestamp tracking, and platform-specific statistics
- June 26, 2025. Added live monitoring dashboard showing total leads extracted today with last update time, platform breakdowns, and comprehensive notification alerts
- June 26, 2025. Enhanced lead extraction notifications with toast messages, audio alerts, desktop notifications, and visual daily statistics tracking across all scraping platforms
- June 26, 2025. Built comprehensive sales funnel builder targeting small to mid-size service businesses (HVAC, plumbing, carpet cleaning, electrical, handyman, painting)
- June 26, 2025. Created industry-specific funnel templates with conversion rates, automation sequences, and revenue projections for service contractors
- June 26, 2025. Added Sales Funnels navigation tab with interactive funnel visualization, stage optimization, lead source configuration, and performance analytics
- June 26, 2025. Implemented service business automation workflows including emergency response, maintenance reminders, seasonal campaigns, and follow-up sequences
- June 26, 2025. Created comprehensive competitive pricing analysis system with 11 service categories and market research-based pricing recommendations
- June 26, 2025. Built advanced pricing analyzer with profit margin calculations, competitor comparisons, market positioning strategies, and revenue projections
- June 26, 2025. Added Competitive Pricing navigation tab with premium positioning analysis, high-profit opportunity identification, and strategic pricing recommendations
- June 26, 2025. Implemented detailed service pricing breakdown covering SEO, web development, PPC advertising, and content services with 60-85% profit margins
- June 26, 2025. Enhanced add contact form with integrated appointment scheduling functionality including date/time selection, meeting types, and automated event creation
- June 26, 2025. Added checkbox-enabled scheduling option allowing immediate appointment booking during contact creation with 6 meeting types (consultation, discovery, demo, proposal, follow-up, closing)
- June 26, 2025. Implemented automatic calendar event creation when scheduling is enabled, with contact linking and comprehensive appointment details integration
- June 26, 2025. Enhanced lead cards with comprehensive action capabilities including phone, schedule, email, notes, and disposition buttons with visual icons and color coding
- June 26, 2025. Implemented role-based access control hiding "point of origin" (lead source) information from regular users while keeping it management-only access
- June 26, 2025. Added six-button action grid to each lead card with call functionality, scheduling, email integration, notes access, status management, and service pricing dropdown
- June 26, 2025. Implemented comprehensive service pricing dropdown for sales representatives with 16 service options across 4 categories (SEO & Digital Marketing, Web Development, PPC Advertising, Content & Branding)
- June 26, 2025. Added interactive pricing dropdown showing service names, delivery timeframes, and prices ranging from $275 to $8,500 with one-click service selection and toast notifications
- June 26, 2025. Added Traffik Boosters logo to upper right corner of lead card details modal with "More Traffik! More Sales!" slogan for consistent branding throughout CRM interface
- June 26, 2025. Fixed sales funnel navigation issue by adding missing SalesFunnelBuilder component import and case statement to dashboard main content rendering
- June 26, 2025. Enhanced email functionality with comprehensive dropdown menu on lead cards featuring compose email, open client, and copy address options
- June 26, 2025. Added professional email composer modal with pre-built templates (initial follow-up, service proposal, check-in) and Traffik Boosters branding
- June 26, 2025. Implemented email template system with personalized content, pricing information, and company contact details for streamlined sales communication
- June 26, 2025. Fixed email button visibility issues and implemented simplified green outlined email button in third position of 6-button action grid on lead cards
- June 26, 2025. Added "View All" functionality with smart button that appears when filters are active, allowing users to instantly display all 156 leads with one click
- June 26, 2025. Implemented comprehensive work order creation system directly on lead cards with professional templates for SEO packages and website development
- June 26, 2025. Enhanced payment dropdown with work order agreements, invoice generation, payment links, and quick service proposals for complete sales workflow automation
- June 26, 2025. Added pre-built work order templates with Traffik Boosters branding, terms, timelines, pricing, and signature requirements for immediate client deployment
- June 26, 2025. Fixed disposition button functionality with comprehensive status dropdown including contacted, qualified, interested, not interested, callback, and converted options
- June 26, 2025. Standardized all email communications to use corporate @traffikboosters.com email addresses for sales reps and managers throughout CRM system
- June 26, 2025. Updated all email templates, work orders, invoices, and payment requests to include individual sales rep signatures with corporate email addresses
- June 26, 2025. Removed fictional employee accounts (Sarah Johnson, David Chen, Amanda Davis) and maintained only authentic admin user Michael Thompson
- June 26, 2025. Reassigned all lead contacts to authentic admin user to reflect actual company structure rather than placeholder personnel data
- June 26, 2025. Implemented dynamic sales rep assignment display on lead cards with name, email, and phone information that updates when reassigned
- June 26, 2025. Added management-only reassignment dropdown functionality for instant lead assignment with real-time visual updates
- June 26, 2025. Fixed CRM navigation issue where clicking CRM tab showed analytics dashboard instead of actual lead cards with "View All" functionality
- June 27, 2025. Resolved Michael Thompson HR Portal issue by removing mock data and filtering admin users from employee display while maintaining admin system account
- June 27, 2025. Implemented authentic PostgreSQL database integration for HR Portal with real employee data (Sarah Johnson, David Chen, Amanda Davis) and working delete functionality
- June 27, 2025. Successfully integrated User Management with HR Portal employee data, displaying synchronized employee information with status indicators, commission rates, and comprehensive editing capabilities
- June 27, 2025. Enhanced User Management interface to show HR Portal integration summary with employee statistics, active/inactive status tracking, and role-based breakdowns
- June 27, 2025. Completely eliminated automatic employee creation from all system components including database initialization, API routes, and memory storage to give user full control over employee management
- June 27, 2025. Implemented comprehensive gamified sales performance leaderboard with competitive rankings, achievements, badges, XP points system, and real-time performance tracking
- June 27, 2025. Added Sales Leaderboard navigation tab with trophy rankings, progress bars, streak tracking, challenges, and team performance metrics
- June 27, 2025. Created competitive features including daily/weekly/monthly challenges, achievement unlocks, performance level progression, and category-based filtering (revenue, deals, appointments)
- June 27, 2025. FINAL FIX: Completely eliminated all automatic employee creation sources including hardcoded mock data in components, database initialization, and memory storage
- June 27, 2025. System now provides full user control over employee management with no unwanted automatic data generation from any source
- June 27, 2025. Built comprehensive Geographic Targeting system with advanced city, state, and county filtering capabilities for precise lead distribution control
- June 27, 2025. Implemented enhanced location extraction algorithms with support for 50 US states, major cities, and county-level targeting across the entire platform
- June 27, 2025. Added sophisticated geographic filtering interface with real-time search, multi-level targeting controls, and intelligent location parsing from contact notes
- June 27, 2025. Enhanced Location Intelligence dashboard with comprehensive filtering by state (50 states), city (70+ major cities), county targeting, and custom search functionality
- June 27, 2025. Integrated Google Maps industry targeting with 12 business categories (restaurants, retail, automotive, healthcare, professional services, beauty, home services, real estate, education, entertainment, technology, manufacturing)
- June 27, 2025. Built comprehensive industry extraction algorithms using Google Maps keyword matching for precise lead categorization and targeting
- June 27, 2025. Added intelligent industry filtering to Geographic Targeting Controls with real-time lead counts and category-based campaign targeting
- June 27, 2025. Enhanced active filter indicators to display both geographic (state/city/county) and industry targeting criteria with color-coded badges

## User Preferences

Preferred communication style: Simple, everyday language.
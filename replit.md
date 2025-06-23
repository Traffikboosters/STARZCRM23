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

## User Preferences

Preferred communication style: Simple, everyday language.
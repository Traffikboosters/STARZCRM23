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

## User Preferences

Preferred communication style: Simple, everyday language.
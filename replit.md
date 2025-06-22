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

## User Preferences

Preferred communication style: Simple, everyday language.
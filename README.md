# ImportIQ - Vehicle Import Intelligence Platform

A cutting-edge vehicle import and data intelligence platform that leverages advanced AI technologies to streamline global automotive acquisition and market analysis.

## Features

- **Live Market Data**: Real-time vehicle listings from Japanese and US auction sites
- **AI-Powered Analysis**: Intelligent vehicle recommendations and market insights
- **Import Cost Calculator**: Comprehensive cost estimation including compliance and shipping
- **Authentic Vehicle Photos**: 10+ inspection photos per vehicle with promotional content filtering
- **User Dashboard**: Personalized vehicle tracking and management
- **Admin Panel**: Complete system administration and analytics

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for recommendations and analysis
- **Authentication**: Replit Auth with session management
- **Data Sources**: Authentic auction data from multiple markets

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd importiq
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env
```

Add the following environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `SESSION_SECRET` - Session secret for authentication
- `REPL_ID` - Replit application ID
- `REPLIT_DOMAINS` - Comma-separated list of allowed domains

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Key Components

### Image Filtering System
- Automatically removes Japanese promotional content
- Retains authentic vehicle inspection photos
- Supports 101-160 and 201-260 sequence ranges
- Fallback system prevents vehicles from showing 0 photos

### Market Data Intelligence
- Real-time scraping from authentic auction sources
- Currency conversion (JPY/USD to AUD)
- Advanced anti-bot countermeasures
- Data quality validation and caching

### AI-Powered Features
- Vehicle recommendations based on user preferences
- Market trend analysis
- Compliance strategy suggestions
- Import cost optimization

## API Endpoints

### Market Data
- `GET /api/live-market-data` - Fetch current vehicle listings
- `GET /api/market-stats` - Market analytics and trends

### AI Features
- `POST /api/ai-recommendations` - Generate vehicle recommendations
- `POST /api/compliance-estimate` - Calculate compliance requirements

### User Management
- `GET /api/auth/user` - Current user information
- `POST /api/submissions` - Submit vehicle inquiry

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/submissions` - All user submissions

## Deployment

This application is designed to run on Replit with automatic deployment capabilities:

1. Push your code to GitHub
2. Connect your Replit project to the GitHub repository
3. Configure environment variables in Replit Secrets
4. Deploy using Replit's deployment system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Proprietary - All rights reserved
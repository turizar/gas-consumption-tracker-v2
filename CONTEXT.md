# Energy Consumption Tracker - SaaS Platform

## 📋 Project Description

A SaaS tool for tracking and analyzing personal electricity consumption, allowing comparison of actual vs expected monthly consumption. The application automatically processes photos of electric meters to extract readings and generate predictive analytics.

## 🎯 Main Objective

Create a platform that allows:
- Register electricity consumption through meter photos
- Compare actual vs expected consumption
- Project annual balance (charge/refund)
- Generate reports and trend analysis

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) - *Pending*
- **Authentication**: Supabase Auth - *Pending*
- **Storage**: Supabase Storage - *Pending*
- **AI/ML**: Google Gemini API (Vision) - ✅ **Implemented**
- **Deploy**: Vercel + Supabase - *Pending*
- **Charts**: Recharts - ✅ **Implemented**

### Current Folder Structure (Implemented)
```
src/
├── app/                    # Next.js 15 App Router
│   ├── dashboard/         # ✅ Main dashboard (IMPLEMENTED)
│   ├── settings/          # ✅ Settings page (BASIC)
│   ├── api/               # API Routes
│   │   └── ai/            # ✅ Google Gemini API (IMPLEMENTED)
│   │       └── process-photo/ # ✅ Photo processing endpoint
│   ├── globals.css        # ✅ Global styles with Tailwind
│   ├── layout.tsx         # ✅ Root layout
│   └── page.tsx           # ✅ Landing page
├── components/            # ✅ Reusable components
│   ├── ui/               # ✅ Base components
│   │   ├── button.tsx    # ✅ Button component
│   │   ├── card.tsx      # ✅ Card component
│   │   └── stat-card.tsx # ✅ Statistics card
│   ├── charts/           # ✅ Charts and visualizations
│   │   ├── ConsumptionChart.tsx # ✅ Interactive consumption chart
│   │   └── ReadingHistory.tsx   # ✅ Reading history component
│   └── forms/            # ✅ Forms
│       └── PhotoUpload.tsx # ✅ Photo upload with AI processing
├── lib/                  # ✅ Utilities and configurations
│   ├── gemini/           # ✅ Google Gemini client (IMPLEMENTED)
│   │   └── client.ts     # ✅ AI processing functions
│   ├── utils/            # ✅ Utility functions
│   └── types/            # ✅ TypeScript types
├── hooks/                # ✅ Custom React hooks
│   └── useReadings.ts    # ✅ Reading management hook
└── constants/            # ✅ Application constants
    └── index.ts          # ✅ Country defaults and configs
```

### 🚧 **Pending Structure** (Next Phase)
```
src/
├── app/
│   ├── (auth)/            # 🚧 Authentication routes
│   ├── api/               # 🚧 Additional API Routes
│   │   ├── auth/          # 🚧 Authentication endpoints
│   │   ├── readings/      # 🚧 CRUD for readings
│   │   └── billing/       # 🚧 Billing configurations
├── lib/
│   ├── supabase/         # 🚧 Supabase client
│   └── auth/             # 🚧 Authentication utilities
```

### Data Flow
```
📱 Meter photo → 📤 Upload to API → 🤖 Google Gemini API → 📊 Reading extraction → 💾 Local Storage → 📈 Chart updates
```

## 🗄️ Database Schema

### Complete Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  country_code VARCHAR(2) DEFAULT 'US',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meters
CREATE TABLE meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  meter_type VARCHAR(50) DEFAULT 'electric',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Readings
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID REFERENCES meters(id) ON DELETE CASCADE,
  reading_value DECIMAL(10,2) NOT NULL,
  photo_url TEXT,
  reading_date DATE NOT NULL,
  is_manual BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(meter_id, reading_date)
);

-- Billing configurations
CREATE TABLE billing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  expected_monthly_consumption DECIMAL(10,2) NOT NULL,
  expected_annual_consumption DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  price_per_kwh DECIMAL(8,4) NOT NULL,
  billing_cycle_start INTEGER NOT NULL DEFAULT 1,
  billing_type VARCHAR(20) DEFAULT 'monthly',
  adjustment_type VARCHAR(20) DEFAULT 'balance',
  adjustment_calculation VARCHAR(20) DEFAULT 'annual',
  valid_from DATE NOT NULL,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Country defaults
CREATE TABLE country_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  avg_price_per_kwh DECIMAL(8,4) NOT NULL,
  avg_monthly_consumption DECIMAL(10,2) NOT NULL,
  billing_cycle_start INTEGER DEFAULT 1,
  billing_type VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consumption projections
CREATE TABLE consumption_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  billing_config_id UUID REFERENCES billing_configs(id) ON DELETE CASCADE,
  projection_date DATE NOT NULL,
  projected_consumption DECIMAL(10,2) NOT NULL,
  projected_cost DECIMAL(10,2) NOT NULL,
  balance_estimate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Data Structure and Flow
```
User → Country → Default Configuration → Meter → Readings → Projections
```

**Relationships**: 1 User → N Meters → N Readings | 1 User → N Configurations | 1 Country → 1 Default Configuration

**Automatic calculations**: Monthly consumption = Current reading - Previous | Annual balance = (Actual - Expected) × Price | Projection = Trend × Remaining months

**Example**: See [`data-structure-example.json`](./data-structure-example.json) for complete structure with US data

## 🚀 Main Features

### ✅ **1. Main Dashboard** (IMPLEMENTED)
- ✅ **Real-time consumption charts** with Recharts
- ✅ **Interactive statistics** that update automatically
- ✅ **AI-powered insights** with dynamic recommendations
- ✅ **Status indicators** (green/yellow/red) based on consumption
- ✅ **Monthly trends** and consumption patterns

### ✅ **2. Reading Management** (IMPLEMENTED)
- ✅ **Photo upload** with drag & drop interface
- ✅ **Google Gemini AI processing** for automatic reading extraction
- ✅ **Confidence scoring** for AI accuracy
- ✅ **Reading history** with edit/delete capabilities
- ✅ **Automatic consumption calculation** between readings

### 🔄 **3. Analysis and Reports** (PARTIAL)
- ✅ **Real-time consumption analysis**
- ✅ **AI-generated insights** and recommendations
- ✅ **Consumption trend visualization**
- 🚧 **Monthly reports** (pending database)
- 🚧 **Data export** (pending implementation)
- 🚧 **High consumption alerts** (pending notifications)

### 🚧 **4. Configuration and Billing Management** (PENDING)
- 🚧 **Meter configuration** (pending database)
- 🚧 **Multiple billing configurations** (pending implementation)
- 🚧 **Expected monthly/annual consumption** (hardcoded)
- 🚧 **Price per kWh and currency** (hardcoded $0.36/kWh)
- 🚧 **Customizable billing cycles** (pending)
- 🚧 **Country default configurations** (pending)
- 🚧 **Annual balance projections** (pending)

## 🌍 Country Configurations
- **US**: USD, $0.132/kWh, 877 kWh/month
- **ES**: EUR, €0.285/kWh, 350 kWh/month (bimonthly)
- **MX**: MXN, $1.85/kWh, 250 kWh/month
- **AR**: ARS, $25.50/kWh, 300 kWh/month

### Multiple Configurations
- Main, seasonal (summer/winter), by contract

## 🔧 Main APIs
- `/api/process-meter-reading` → OpenAI Vision API to extract readings
- `/api/billing-configs` → CRUD billing configurations
- `/api/country-defaults` → Country configurations

## 📱 User Experience

### Main Flow
1. **Registration** → Country → Default configuration
2. **Meter setup** → Expected consumption, prices
3. **Photo upload** → AI extracts reading → Validation
4. **Dashboard** → Charts updated automatically

### Responsive Design
- **Mobile-first** for photo upload
- **Desktop-optimized** for analysis and reports
- **PWA capabilities** for basic offline use

## 🔐 Security and Privacy

- **Authentication**: Supabase Auth with JWT
- **Authorization**: Row Level Security (RLS) in Supabase
- **Storage**: User access policies
- **Data**: Encryption in transit and at rest
- **GDPR**: Compliance with privacy regulations

## 📊 Metrics
- **User**: Current vs expected consumption, annual balance, trends
- **Platform**: Active users, AI accuracy, processed photos

## 🚀 Roadmap

### ✅ **Phase 1: MVP Core Features** (COMPLETED)
- ✅ **AI Integration**: Google Gemini API for meter reading extraction
- ✅ **Photo Upload**: Drag & drop interface with real-time processing
- ✅ **Interactive Dashboard**: Real-time charts and statistics
- ✅ **Reading Management**: Complete CRUD system with calculations
- ✅ **AI Insights**: Dynamic recommendations and analysis
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🔄 **Phase 2: Production Ready** (NEXT)
- 🗄️ **Database**: Supabase integration with PostgreSQL
- 🔐 **Authentication**: Multi-user support with secure sessions
- 📊 **Advanced Analytics**: Monthly reports and projections
- 💾 **Data Persistence**: Cloud storage for photos and readings
- 🌍 **Multi-country**: Country-specific configurations

### 🚀 **Phase 3: Scale & Optimize** (FUTURE)
- 📱 **PWA**: Offline capabilities and mobile app features
- 🔔 **Notifications**: Smart alerts and reminders
- 📈 **Advanced Reports**: Export and sharing capabilities
- 🎯 **AI Enhancement**: Improved accuracy and features
- 🌐 **Deployment**: Production-ready with monitoring

## 📁 Current Project Status

### ✅ Completed (Phase 1 - MVP)
- **Project Structure**: Next.js 15 with TypeScript and Tailwind CSS
- **Database Schema**: Complete SQL schema defined
- **Type Definitions**: All TypeScript interfaces created
- **Google Gemini Integration**: ✅ **Fully implemented** with real AI processing
- **Photo Upload System**: ✅ **Working** with drag & drop and AI processing
- **Interactive Dashboard**: ✅ **Complete** with real-time updates
- **Chart System**: ✅ **Recharts implemented** with consumption trends
- **Reading Management**: ✅ **Full system** with history and calculations
- **AI Insights**: ✅ **Dynamic recommendations** based on real data
- **UI Components**: ✅ **Complete** button, card, stat-card components
- **Custom Hooks**: ✅ **useReadings hook** for state management
- **Utilities**: ✅ **Calculation and formatting** functions
- **Constants**: ✅ **Country defaults** and configuration constants
- **Documentation**: ✅ **Updated** CONTEXT.md and README.md

### 🔄 In Progress
- **Local Storage**: Currently using browser localStorage (temporary)
- **Data Persistence**: Need to migrate to Supabase database

### 📋 Next Steps (Phase 2 - Production Ready)

#### 🗄️ **Priority 1: Database & Persistence**
1. **Supabase Setup**: Create project and run database schema
2. **Data Migration**: Move from localStorage to Supabase
3. **API Endpoints**: Create CRUD endpoints for readings, users, billing
4. **Real-time Sync**: Implement real-time data synchronization

#### 🔐 **Priority 2: Authentication & Security**
5. **Supabase Auth**: Implement login/register flows
6. **User Management**: Multi-user support with data isolation
7. **Security**: Row Level Security (RLS) policies
8. **Session Management**: Persistent user sessions

#### 🚀 **Priority 3: Production Features**
9. **Photo Storage**: Supabase Storage for meter photos
10. **Billing Configurations**: Multiple billing setups per user
11. **Country Defaults**: Automatic configuration based on location
12. **Advanced Analytics**: Monthly reports and projections

#### 📱 **Priority 4: Enhanced UX**
13. **PWA Features**: Offline capability and mobile app feel
14. **Notifications**: Consumption alerts and reminders
15. **Data Export**: CSV/PDF export functionality
16. **Mobile Optimization**: Enhanced mobile photo capture

#### 🌐 **Priority 5: Deployment**
17. **Vercel Deployment**: Production deployment
18. **Environment Configuration**: Production environment variables
19. **Monitoring**: Error tracking and performance monitoring
20. **Domain & SSL**: Custom domain setup

### 🛠️ Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 📂 Project Location
```
/Users/tomasurizar/Desktop/MyPortfolio/energy-consumption-tracker/
```

## 🎯 **Current Status Summary**

### ✅ **What's Working Now**
- **🤖 AI-Powered Meter Reading**: Google Gemini API extracts real readings from photos
- **📊 Interactive Dashboard**: Real-time charts and statistics that update automatically
- **📱 Photo Upload**: Drag & drop interface with instant AI processing
- **📈 Consumption Tracking**: Automatic calculation of consumption between readings
- **🧠 Smart Insights**: AI-generated recommendations based on consumption patterns
- **💾 Data Management**: Complete reading history with edit/delete capabilities
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS

### 🚧 **What's Missing (Next Phase)**
- **🗄️ Database**: Currently using browser localStorage (data lost on clear)
- **🔐 Authentication**: No user accounts or data persistence
- **☁️ Cloud Storage**: Photos are processed but not saved
- **👥 Multi-user**: Single user experience only
- **🌍 Country Configs**: Hardcoded pricing and settings

### 🎯 **Immediate Next Steps**
1. **Set up Supabase project** and database
2. **Implement authentication** system
3. **Migrate data** from localStorage to database
4. **Add photo storage** to Supabase
5. **Deploy to production** on Vercel

---

*Version: 2.0.0 - MVP Complete, Ready for Production*

# Energy Consumption Tracker

A modern web application for tracking electricity consumption with AI-powered meter reading capabilities.

## 🚀 Features

- **Smart Photo Upload**: Take photos of your meter and let AI extract readings automatically
- **Real-time Analytics**: Track consumption trends and get insights on your energy usage
- **Cost Optimization**: Compare actual vs expected consumption and optimize your bills
- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **AI Integration**: OpenAI integration for intelligent meter reading extraction

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI**: OpenAI API
- **UI Components**: Radix UI + Custom components
- **Charts**: Recharts

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd energy-consumption-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── ai/           # AI-related endpoints
│   │   ├── auth/         # Authentication endpoints
│   │   ├── billing/      # Billing endpoints
│   │   └── readings/     # Meter reading endpoints
│   ├── dashboard/        # Dashboard page
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable components
│   ├── charts/          # Chart components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── constants/           # Application constants
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── openai/          # OpenAI client configuration
│   ├── supabase/        # Supabase client configuration
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
```

## 🎯 Current Status

✅ **Completed:**
- Project structure and configuration
- Basic UI components (Button)
- Home page with landing design
- Dashboard and Settings placeholder pages
- Tailwind CSS configuration
- TypeScript setup
- Utility functions for calculations

🚧 **In Progress:**
- Supabase integration
- OpenAI API integration
- Meter reading functionality
- User authentication
- Data visualization

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, please open an issue in the repository or contact the development team.
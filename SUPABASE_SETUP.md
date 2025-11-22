# 🚀 Supabase Setup Guide

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Google Gemini API Key**: Get your free API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🛠️ Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `energy-consumption-tracker`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### 2. Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

### 3. Configure Environment Variables

1. Copy `.env.local` from your current setup
2. Add the Supabase credentials:

```bash
# Google Gemini API
# Get your free API key at: https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. Verify tables are created:
   - `house_readings` (with `user_id` column)
   - `house_config` (with `user_id` column)
5. Verify RLS policies are created (users can only access their own data)

### 5. Set Up Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Configure:
   - **Name**: `meter-photos`
   - **Public**: ✅ (checked)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `image/*`
4. Click "Create bucket"

### 6. Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000/dashboard`
3. Upload a photo of your meter
4. Check if:
   - ✅ Photo is processed by Gemini AI
   - ✅ Reading is saved to database
   - ✅ Photo is stored in Supabase Storage
   - ✅ Dashboard updates with new data

## 🔍 Troubleshooting

### Common Issues

**1. "Invalid API key" error**
- Check if environment variables are correctly set
- Restart the development server after changing `.env.local`

**2. "Failed to upload photo" error**
- Verify storage bucket `meter-photos` exists
- Check bucket permissions (should be public)

**3. "Database connection failed" error**
- Verify Supabase URL and keys are correct
- Check if database schema was created successfully

### Verification Steps

1. **Check Database**: Go to **Table Editor** → `house_readings` → should see your readings
2. **Check Storage**: Go to **Storage** → `meter-photos` → should see uploaded photos
3. **Check Logs**: Go to **Logs** → API → should see successful requests

## 📊 What's Stored

### Database Tables

**`house_readings`**
- Reading values and dates
- Consumption calculations
- Cost calculations
- AI confidence scores
- Photo URLs

**`house_config`**
- Price per kWh
- Currency
- Expected monthly consumption
- Country settings

### Storage

**`meter-photos` bucket**
- Original photos uploaded
- Organized by timestamp
- Public URLs for easy access

## 🎯 Next Steps

Once Supabase is configured:

1. **Register a new account** at `/register`
2. **Login** at `/login`
3. **Test photo uploads** (should save to your account)
4. **Verify data persistence** (refresh page, data should remain)
5. **Check data isolation** (each user sees only their own data)
6. **Test consumption calculations** (should be accurate)

## 🔐 Authentication

The app now supports multi-user authentication:
- **Demo Mode**: Unauthenticated users can view demo data
- **Authenticated Mode**: Registered users can save and manage their own readings
- **Data Isolation**: Each user's data is protected by Row Level Security (RLS)

## 💡 Benefits

- ✅ **Data Persistence**: No more lost data on page refresh
- ✅ **Photo Storage**: Photos saved permanently in the cloud
- ✅ **Scalability**: Ready for future multi-user features
- ✅ **Backup**: Automatic database backups
- ✅ **Performance**: Fast queries and real-time updates

---

**Need help?** Check the Supabase documentation or create an issue in the project repository.

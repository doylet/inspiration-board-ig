# Instagram Inspiration Board

An MVP application that allows users to authenticate with their Professional Instagram Account and download their saved images using the Instagram Graph API.

## Features

- 🔐 OAuth authentication with Instagram Professional Accounts
- 📸 View all your Instagram media (photos, videos, carousel albums)
- ⬇️ Download images and video thumbnails
- 🎨 Beautiful, responsive UI built with Next.js and Tailwind CSS
- 🔒 Secure session management with NextAuth.js

## Prerequisites

- Node.js 18+ installed
- A Facebook Developer account
- A Professional Instagram Account (Business or Creator)

## Instagram App Setup

Before running the application, you need to create a Facebook/Instagram App:

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Other"** as your use case
4. Select **"Business"** as your app type
5. Fill in your app details:
   - **App Name**: Instagram Inspiration Board (or your preferred name)
   - **App Contact Email**: Your email address
6. Click **"Create App"**

### 2. Add Instagram Graph API

1. In your app dashboard, find **"Instagram Graph API"** in the product list
2. Click **"Set Up"** or **"Add Product"**
3. This will add Instagram Graph API to your app

### 3. Configure OAuth Settings

1. Go to **"Instagram Graph API"** → **"Basic Settings"** in the left sidebar
2. Scroll down to **"Basic Settings"** and note your:
   - **App ID** (Instagram App ID)
   - **App Secret** (click "Show" to reveal)
3. Add a **"Privacy Policy URL"** (required for app review, can be a placeholder for development)
4. Add a **"Terms of Service URL"** (optional)
5. Click **"Save Changes"**

### 4. Add OAuth Redirect URIs

1. Go to **"Instagram Graph API"** → **"Products"** → **"Instagram"** → **"Basic Settings"**
2. Scroll to **"Valid OAuth Redirect URIs"**
3. Add the following URLs:
   - For local development: `http://localhost:3000/api/auth/callback/instagram`
   - For production: `https://yourdomain.com/api/auth/callback/instagram`
4. Click **"Save Changes"**

### 5. Add Test Users (for Development)

Before your app is approved by Facebook, you can only test with specific Instagram accounts:

1. Go to **"Roles"** → **"Roles"**
2. Click **"Add Testers"**
3. Add Instagram accounts that you want to test with
4. The Instagram account owner needs to accept the invitation at:
   - [https://www.instagram.com/accounts/manage_access/](https://www.instagram.com/accounts/manage_access/)

### 6. App Review (for Production)

For production use with any Instagram account:

1. Go to **"App Review"** → **"Permissions and Features"**
2. Request access to:
   - `instagram_graph_user_profile`
   - `instagram_graph_user_media`
3. Follow Facebook's review process guidelines
4. Note: Review can take several days

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd inspiration-board-ig
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
INSTAGRAM_APP_ID=your_app_id_from_facebook
INSTAGRAM_APP_SECRET=your_app_secret_from_facebook
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
```

To generate a `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Click **"Login with Instagram"** and authorize the app

4. You'll be redirected to your dashboard where you can view and download your Instagram media

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth.js configuration
│   │   └── instagram/
│   │       ├── user/               # Get user profile
│   │       ├── media/              # Get user media
│   │       └── download/           # Download media endpoint
│   ├── dashboard/                   # Main dashboard page
│   ├── layout.tsx                   # Root layout with providers
│   └── page.tsx                     # Landing/login page
├── components/
│   └── Providers.tsx                # NextAuth SessionProvider wrapper
├── types/
│   ├── instagram.ts                 # Instagram API types
│   └── next-auth.d.ts              # NextAuth type extensions
└── .env.local                       # Environment variables (not in git)
```

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication handlers

### Instagram Data
- `GET /api/instagram/user` - Fetch authenticated user's profile
- `GET /api/instagram/media` - Fetch user's Instagram media
- `GET /api/instagram/download?url=<media_url>` - Download a specific media file

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **NextAuth.js** - Authentication solution
- **Tailwind CSS** - Utility-first CSS framework
- **Instagram Graph API** - Instagram data access

## Limitations

- Only works with **Professional Instagram Accounts** (Business or Creator)
- During development, only test users can authenticate
- Rate limits apply to Instagram Graph API calls
- Videos download their thumbnails, not the full video file
- Carousel albums show the cover image only

## Troubleshooting

### "OAuth Error: redirect_uri_mismatch"
- Ensure your redirect URI in Facebook App settings exactly matches: `http://localhost:3000/api/auth/callback/instagram`
- No trailing slash, correct protocol (http for local, https for production)

### "This app is in Development Mode"
- Your app needs to be submitted for App Review to work with non-test users
- Add test users in Facebook Developer Console → Roles → Roles

### "Invalid OAuth access token"
- Your `INSTAGRAM_APP_ID` or `INSTAGRAM_APP_SECRET` may be incorrect
- Check your `.env.local` file
- Restart your dev server after changing environment variables

### "User must be authenticated"
- Make sure you're logged in
- Check that NextAuth is properly configured
- Clear cookies and try logging in again

## Future Enhancements

- [ ] Add pagination for large media collections
- [ ] Filter by media type (images, videos, albums)
- [ ] Search and filter by caption
- [ ] Bulk download functionality
- [ ] Save/bookmark specific posts
- [ ] Display Instagram Insights/analytics
- [ ] Support for Instagram Stories API

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT

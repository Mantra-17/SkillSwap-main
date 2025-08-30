# SkillSwap - Skill Exchange Platform

A modern web application that connects people who want to learn new skills with those who can teach them. Built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure sign-up/sign-in with email/password
- **OAuth Authentication**: Sign in with Google and GitHub
- **Password Reset**: Secure password recovery via email
- **Skill Management**: Browse, search, and manage skills
- **Swap Requests**: Request skill exchanges with other users
- **User Profiles**: Comprehensive user profiles and ratings
- **Real-time Updates**: Live notifications and updates
- **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth support
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS with custom design system

## OAuth Configuration

To enable Google and GitHub authentication, you need to configure OAuth providers in your Supabase project:

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - `http://localhost:8080/` (for development)
7. Copy Client ID and Client Secret
8. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: "SkillSwap"
   - Homepage URL: Your app URL
   - Authorization callback URL: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Paste Client ID and Client Secret
   - Save

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkillSwap-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   JWT_SECRET=your_jwt_secret
   ```

4. **Configure OAuth Providers**
   Follow the OAuth setup instructions above in your Supabase dashboard.

5. **Run the application**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   cd backend && npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

## Project Structure

```
SkillSwap-main/
├── src/                    # Frontend source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   └── main.tsx          # Application entry point
├── backend/               # Backend API server
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## Authentication Flow

### Email/Password Authentication
1. User enters email and password
2. Supabase validates credentials
3. User is signed in and redirected to home

### OAuth Authentication
1. User clicks Google/GitHub button
2. Redirected to OAuth provider
3. User authorizes the application
4. Redirected back with authentication tokens
5. Supabase creates/updates user account
6. User is signed in and redirected to home

### Password Reset
1. User clicks "Forgot password"
2. Enters email address
3. Reset email is sent via Supabase
4. User clicks reset link in email
5. Redirected to reset password form
6. New password is set and user is signed in

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

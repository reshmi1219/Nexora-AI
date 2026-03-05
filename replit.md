# AutoFlow — AI Business Automation Platform

A production-ready Expo React Native mobile app that helps small businesses automate tasks using AI.

## Stack

- **Frontend**: Expo SDK 54, React Native, Expo Router (file-based routing)
- **Backend**: Express.js (TypeScript), serves landing page and API routes
- **Storage**: AsyncStorage for local data persistence
- **UI**: Custom dark theme, Inter font, react-native-reanimated animations

## App Architecture

```
app/
  _layout.tsx         # Root layout with providers (Auth, Business, QueryClient)
  index.tsx           # Entry redirect based on auth state
  onboarding.tsx      # 4-slide animated onboarding
  login.tsx           # Email login screen
  signup.tsx          # Email signup screen
  setup.tsx           # 4-step business setup wizard
  (main)/
    _layout.tsx       # Tab navigation (NativeTabs + Classic fallback)
    index.tsx         # Dashboard with analytics + AI tools
    appointments.tsx  # Calendar + appointment management
    profile.tsx       # Profile + subscription plans
  chatbot.tsx         # AI Chatbot manager (modal)
  website.tsx         # AI Website Builder with preview (modal)
  social.tsx          # Social Media Content Generator (modal)

context/
  auth.tsx            # Auth state (user, login, signup, logout)
  business.tsx        # Business state (profile, appointments, posts, analytics)

constants/
  colors.ts           # Dark/light theme palette
```

## Color Palette

- Background: `#04040A` (very dark navy)
- Surface: `#0D0E1A`
- Card: `#151628`
- Accent (blue): `#3D7BFF`
- Accent (teal): `#00D4A0`
- Accent (amber): `#F59E0B`
- Accent (pink): `#E879A0`

## Key Features

1. **Onboarding** — 4-slide animated intro with swipeable cards
2. **Authentication** — Email login/signup with AsyncStorage sessions
3. **Business Setup** — 4-step wizard (name, industry, about, brand color)
4. **Dashboard** — Analytics grid, business banner, AI tools quick access
5. **AI Chatbot** — Live chat simulation + bot configuration panel
6. **Website Builder** — Template picker + section editor + live preview
7. **Appointment Manager** — Calendar view + booking form + status management
8. **Social Content Generator** — Platform selector, topic picker, AI generation
9. **Profile & Subscription** — 3-tier plan display, settings, logout

## Workflows

- **Start Backend**: `npm run server:dev` — Express on port 5000
- **Start Frontend**: `npm run expo:dev` — Expo Metro on port 8081

## Navigation Flow

```
/ → (check auth) → /onboarding → /login → /signup
                              → /setup (business wizard)
                              → /(main) (tabs)
                                ├── Dashboard → /chatbot (modal)
                                │            → /website (modal)
                                │            → /social (modal)
                                ├── Appointments
                                └── Profile
```

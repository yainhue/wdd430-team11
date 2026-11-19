# SkillLink

SkillLink connects customers with service providers in their community. The
current implementation includes customer/provider registration and password
authentication, with account data stored in MongoDB and sessions managed by
Auth.js.

## Team Members
Tumwesige Nelson
Oweki Denis
Yain Huento

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `MONGODB_URI` to your MongoDB connection string.
4. Replace `AUTH_SECRET` with a randomly generated secret (for example, run
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
5. Start the app with `npm run dev`, then open
   [http://localhost:3000](http://localhost:3000).

Registration validates account details on the server, stores a bcrypt-hashed
password, and assigns the selected customer or provider role. Login uses
Auth.js Credentials and a JWT-backed session. Never commit `.env.local` or
production secrets.


## Design Choices
MVP Pages / Routes:

/
/login
/register

/services
/services/[id]

/provider/services
/provider/services/new
/provider/services/[id]/edit

/bookings

/dashboard/customer
/dashboard/provider

/profile

Reusable Components:
Header
Footer
NavLinks
SearchBar
FilterBar
ServiceCard
BookingCard
ProviderCard
LoginForm
RegisterForm
DashboardStats
BookingForm

Component Hierarchy:
RootLayout
├── Header
│   └── NavLinks
├── Page
│   ├── SearchBar
│   ├── FilterBar
│   ├── ServiceCard[]
│   ├── BookingCard[]
│   ├── ProviderCard[]
│   └── DashboardStats
└── Footer

Design Theme & Branding:

Color Palette:
   Primary: #1C398E
   Secondary: #7073CF
   Accent: #B5BDF7
   Background:#F8FAFC
   Text: #1F2937
Typography:
   Primary Font: DM Sans
   Fallback: sans-serif
ZeroDay Squad

A cybersecurity-focused web platform to showcase projects, achievements, and team member profiles — built with a modern, secure, and scalable stack.

“We find flaws before they become threats.”

🚀 Project Overview

ZeroDay Squad is designed for cybersecurity teams to:

Publish individual and team projects

Track achievements (CTFs, certifications, research, etc.)

Maintain public member profiles

Enforce role-based access (Admin / Member)

Provide a clean, premium, cyber-themed UI

🛠️ Tech Stack

Vite – Fast frontend tooling

React + TypeScript – UI and type safety

Tailwind CSS – Styling

shadcn/ui – Component system

Supabase – Authentication, database, storage

React Query – Data fetching & caching

React Router – Client-side routing

📂 Project Setup (Local Development)
Prerequisites

Node.js (v18+ recommended)

npm
(You can install Node using nvm if needed)

Steps
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate into the project
cd zeroday-hub

# Install dependencies
npm install

# Start development server
npm run dev


The app will be available at:

http://localhost:5173

🔐 Authentication & Roles

Public users: View projects, achievements, and profiles

Members: Manage their own projects and achievements

Admins: Full control over members, projects, achievements, and site stats

User roles and permissions are enforced using Supabase Row Level Security (RLS).

🧩 Project Structure

pages/ – Route-based pages (Projects, Achievements, Profiles, Dashboards)

components/ – Reusable UI components

hooks/ – Data-fetching and logic hooks

lib/ – Utilities and Supabase client

public/ – Static assets (favicon, images)

📦 Build for Production
npm run build


The production-ready files will be generated in the dist/ folder.

🌐 Deployment

You can deploy the dist folder to any static hosting provider, such as:

Vercel (recommended)

Netlify

Cloudflare Pages

GitHub Pages

HTTPS and custom domains are supported by most providers.

📄 License

This project is private to ZeroDay Squad.
All rights reserved.
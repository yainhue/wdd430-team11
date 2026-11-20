# SkillLink – Copilot Instructions

## Project Overview
SkillLink is a local services marketplace that connects customers with service providers in their communities.

## Technology Stack
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- MongoDB
- Auth.js for authentication
- bcryptjs for password hashing

## Development Guidelines

1. Use TypeScript for all application code.
2. Use the Next.js App Router structure.
3. Build reusable components instead of repeating code.
4. Use Tailwind CSS for styling.
5. Make all pages responsive for mobile and desktop.
6. Use clear names for variables, functions, components, and files.
7. Validate user input on the server.
8. Never store plain-text passwords. Use bcryptjs to hash passwords.
9. Protect routes and database operations according to user roles.
10. Customers must only access their own bookings.
11. Providers must only manage their own services.
12. Handle errors and display clear feedback to users.
13. Keep secrets and environment variables in `.env` files. Never commit them to Git.
14. Follow the existing project structure and coding conventions.
15. Avoid adding dependencies unless they are necessary.

## Account Roles
- Customer: searches for services and makes bookings.
- Provider: creates and manages service listings and handles bookings.

## Database Guidelines
- Use MongoDB for persistent data.
- Use ObjectIds to connect related documents.
- Keep email addresses unique.
- Store creation and update dates where appropriate.
- Validate booking status changes on the server.

## Code Quality
- Keep components focused and maintainable.
- Use meaningful TypeScript types.
- Run linting before submitting changes.
- Test important functionality before creating a pull request.
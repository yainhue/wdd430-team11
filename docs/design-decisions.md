# SkillLink Design Decisions

## 1. Design Overview

SkillLink is a local services marketplace that connects customers with service providers in their communities.

The design focuses on simplicity, accessibility, trust, and ease of navigation.

## 2. Color Palette

| Color | Hex Code | Purpose |
|---|---|---|
| Primary Navy | #0B2F80 | Main branding and prominent sections |
| Secondary Blue | #123984 | Headings and brand elements |
| Orange | #C2410C | Buttons and calls to action |
| Light Background | #F8F9FC | Page background |
| Main Text | #17264A | Primary text |
| White | #FFFFFF | Cards and form backgrounds |

## 3. Typography

- Primary font: Geist Sans
- Secondary font: Geist Mono
- Fallback fonts: Arial and Helvetica
- Font loading: Next.js Google Font integration

## 4. Layout and Spacing

- Responsive layout using Tailwind CSS.
- Two-column layout on larger screens.
- Stacked sections on smaller screens.
- Centered authentication form.
- Rounded cards and input fields.
- Consistent spacing using Tailwind utility classes.
- Clear visual separation between content sections.

## 5. Reusable Components

The planned reusable components include:

- Header
- Footer
- NavLinks
- SearchBar
- FilterBar
- ServiceCard
- BookingCard
- ProviderCard
- LoginForm
- RegisterForm
- DashboardStats
- BookingForm

## 6. User Experience Decisions

- Separate customer and provider account roles.
- Simple registration and login process.
- Clear form labels and validation messages.
- Responsive design for mobile and desktop.
- Consistent colors and typography.
- Clear feedback when users submit forms.

## 7. Technology

- Framework: Next.js
- Styling: Tailwind CSS 4
- Language: TypeScript
- Font: Geist Sans and Geist Mono
- Authentication: Auth.js
- Database: MongoDB

## 8. Design Rationale

Navy blue communicates professionalism and trust. Orange highlights important actions and makes buttons easy to identify. The light background improves readability, while consistent spacing and rounded elements create a clean interface.
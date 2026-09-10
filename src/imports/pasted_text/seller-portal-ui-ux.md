You are an expert product designer and senior frontend UI/UX engineer.

I am building **Nova Market**, a multi-vendor e-commerce marketplace with three separate portals:

* **Buyer**: customers who browse products, manage their cart, place orders and track purchases.
* **Seller**: businesses/local sellers who manage their store, products, inventory, orders, customers, reviews and sales.
* **Admin**: platform administrators who manage the marketplace, sellers, users, stores, categories, products and platform-level operations.

Your task is to design and implement a **high-quality Seller Portal UI/UX**.

## 1. Main objective

Create a professional, modern, production-ready Seller application.

The Seller portal must feel like a real e-commerce management platform, not a generic admin dashboard.

The design should prioritize:

* clarity
* efficiency
* scalability
* responsive behavior
* information hierarchy
* fast access to frequent seller actions
* excellent empty/loading/error states
* consistent spacing and typography
* accessible interactions
* intuitive navigation

The Seller portal should clearly feel different from the Admin portal while remaining part of the same Nova Market design system.

## 2. IMPORTANT: use the provided design system

I will provide my existing `index.css`, which contains the project's CSS variables, colors, theme and design tokens.

**You MUST use the existing variables and theme from `index.css`.**

Do NOT invent a new color palette.

Do NOT replace the existing theme with arbitrary colors.

Do NOT introduce a completely different visual language.

Use the existing design tokens consistently for:

* background
* foreground/text
* primary
* secondary
* muted
* accent
* destructive/error
* borders
* cards
* inputs
* focus states
* charts
* badges
* buttons
* hover states

If a color or design token is not explicitly available, derive the styling from the existing theme rather than introducing random colors.

## 3. Seller mindset

Design the interface from the perspective of a seller who uses the application every day.

The seller needs to quickly answer questions such as:

* How much did I sell today?
* How many orders need attention?
* Which products are low in stock?
* Which orders are pending?
* Which products are performing well?
* What are my recent sales?
* What needs action right now?
* How are customers reviewing my store?

Avoid overwhelming the seller with unnecessary platform-level information.

The Seller portal should focus on **their store and their business**, not marketplace administration.

## 4. Recommended application structure

Create a clear seller navigation structure such as:

### Dashboard

* Sales overview
* Revenue
* Orders
* Products
* Customers
* Conversion/performance indicators where appropriate
* Recent orders
* Top-selling products
* Low-stock products
* Recent reviews
* Quick actions

### Orders

* Order list
* Search
* Filters
* Status filters
* Order details
* Customer information
* Order items
* Payment information
* Shipping/delivery information
* Order status management

Statuses should have clear visual differentiation without relying only on color.

### Products

* Product list
* Search
* Filters
* Categories
* Status
* Stock
* Price
* Product creation
* Product editing
* Product details
* Product activation/deactivation
* Product deletion with confirmation

Product management should be optimized for frequent seller operations.

### Inventory

* Stock overview
* Low-stock alerts
* Out-of-stock products
* Stock adjustments
* Inventory status
* Search/filter/sort

### Customers

* Customer list
* Customer details
* Order history
* Total spending
* Number of orders
* Last order
* Customer activity where appropriate

### Reviews

* Store/product reviews
* Rating overview
* Rating distribution
* Review list
* Review details
* Seller response capability if supported

### Store

* Store profile
* Store information
* Logo/banner
* Contact information
* Address
* Store status
* Store presentation settings

### Analytics

* Revenue
* Orders
* Average order value
* Product performance
* Sales trends
* Top products
* Useful date ranges
* Clear charts with readable labels

### Settings

* Store settings
* Account settings
* Notifications
* Security/preferences where applicable

Do not blindly implement every section if the existing application structure suggests a better organization. Preserve consistency with the existing project.

## 5. Layout

Use a professional application shell:

* responsive sidebar/navigation
* top header
* page title
* contextual actions
* breadcrumbs where useful
* responsive content area
* consistent max-width/content spacing

Desktop should optimize for productivity.

Tablet should remain comfortable and usable.

Mobile should not simply shrink the desktop UI.

On mobile:

* sidebar should become a mobile navigation pattern
* tables should become responsive layouts/cards where necessary
* filters should be easy to access
* actions should remain discoverable
* important information should remain visible without excessive horizontal scrolling

## 6. Dashboard UX

The Seller Dashboard is especially important.

Create a strong visual hierarchy.

Example structure:

1. Page header

   * "Dashboard"
   * useful date/range selector
   * primary quick action

2. KPI cards

   * Revenue
   * Orders
   * Products
   * Customers or another meaningful seller metric

3. Sales analytics section

   * revenue/order trend
   * useful timeframe selector

4. Operational section

   * pending orders
   * low-stock products
   * products requiring attention

5. Performance section

   * top products
   * recent orders
   * recent reviews

Do not fill the screen with decorative charts.

Every visualization must answer a useful business question.

## 7. Tables

Tables should be highly usable.

Include when relevant:

* search
* filtering
* sorting
* pagination
* row actions
* status badges
* useful columns only
* responsive behavior
* empty states
* loading states
* error states

Avoid excessively wide tables.

For mobile, transform complex tables into cards or stacked information when appropriate.

## 8. Forms

Seller forms should feel polished and easy to complete.

Use:

* clear labels
* helpful descriptions
* validation messages
* appropriate input types
* logical grouping
* section headers
* consistent spacing
* save/cancel actions
* unsaved-change protection where appropriate

For product creation/editing, group information logically, for example:

* Basic information
* Pricing
* Inventory
* Category
* Images
* Description
* Status

Do not create giant unstructured forms.

## 9. States

Every important page/component must consider:

### Loading

Use appropriate skeletons rather than making the interface jump around.

### Empty

Explain what is empty and provide a relevant action when possible.

Example:

"No products yet"
"Add your first product to start selling."

### Error

Show a clear explanation and recovery action.

### Success

Use appropriate toast/feedback patterns.

### Disabled

Clearly communicate why an action is unavailable when relevant.

### Confirmation

Destructive actions such as deleting products or changing important statuses should require confirmation.

## 10. UX principles

Follow these principles:

* progressive disclosure
* strong visual hierarchy
* predictable interactions
* minimal cognitive load
* consistent interaction patterns
* clear primary actions
* secondary actions should not compete visually
* destructive actions must be visually distinct
* avoid unnecessary modals
* avoid excessive borders
* avoid excessive shadows
* avoid visual clutter
* maintain generous but efficient spacing

Do not make every element visually loud.

## 11. Visual direction

The UI should feel:

* modern
* professional
* clean
* trustworthy
* efficient
* premium but not flashy
* suitable for a real e-commerce business

Avoid:

* generic SaaS template appearance
* excessive gradients
* excessive glassmorphism
* oversized cards
* giant decorative illustrations
* unnecessary animations
* excessive rounded containers
* dashboard clutter
* random colors
* inconsistent icon styles

Use subtle animations only where they improve feedback or navigation.

## 12. Icons

Use a consistent icon library already present in the project.

Do not mix multiple icon styles.

Icons should support comprehension, not decorate every sentence.

## 13. Reusability

Build reusable components for repeated patterns:

* KPI cards
* status badges
* data tables
* filters
* search fields
* pagination
* empty states
* loading skeletons
* confirmation dialogs
* form sections
* page headers
* responsive navigation

Avoid duplicating UI logic unnecessarily.

## 14. Existing project constraints

Do not rewrite the application's architecture unnecessarily.

Respect the existing:

* React structure
* routing
* components
* hooks
* API layer
* TypeScript/types
* CSS variables
* theme
* existing UI components

If a component already exists and can be reused, reuse it.

If an existing component is inadequate, improve it rather than creating several competing versions.

## 15. Data

If backend/API data is not available yet, use realistic mock data strictly for presentation.

Mock data should look realistic for a Malagasy multi-vendor e-commerce marketplace.

Do not hardcode fake business logic into reusable components.

Keep data separate from presentation so it can later be replaced by API calls.

## 16. Internationalization

The application already supports internationalization.

Do not hardcode user-facing strings directly into components if the project already has an i18n system.

Use translation keys consistently.

The UI should be designed so text expansion does not break layouts.

## 17. Accessibility

Follow good accessibility practices:

* semantic HTML
* keyboard navigation
* visible focus states
* accessible labels
* sufficient contrast
* buttons should be understandable without relying only on icons
* status should not rely only on color
* dialogs should be keyboard accessible

## 18. Final quality bar

The result should look like a **real production Seller Portal**, not a prototype.

Before considering the implementation complete, review every page for:

* visual consistency
* responsive behavior
* spacing
* typography
* hierarchy
* interaction states
* loading states
* empty states
* error states
* accessibility
* reusable components
* consistency with `index.css`

Most importantly:

**The Seller portal must be optimized for managing a business efficiently.**

Do not copy the Admin portal and simply change the title.

The Admin manages the marketplace.

The Seller manages their store.

Design the UX around that distinction.

---

## Existing design system

The following is the project's current `index.css`.

Use these variables and theme as the source of truth:

[PASTE index.css HERE]

---

## Expected output

Implement the Seller Portal UI using the existing project architecture and design system.

Prioritize the core Seller experience first:

1. Seller Dashboard
2. Orders
3. Products
4. Inventory
5. Customers
6. Reviews
7. Store management
8. Analytics
9. Settings

Make the UI coherent across all pages and ensure that components are reusable rather than independently styled page by page.

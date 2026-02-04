# Web Development Terminology Guide

A reference for common terms used in this project to help with communication and debugging.

---

## UI Components (What Users See)

### Modal
A popup window/dialog that appears on top of the page content, often blocking interaction with the page behind it until closed.
- **Example in our app**: The "Loading your design..." popup
- **When to use term**: "The loading modal is stuck" or "Close the modal"

### Toast
A small temporary notification that appears (usually at the top or bottom corner) and disappears automatically.
- **Example in our app**: "Design saved successfully!" or "Failed to upload thumbnail"
- **When to use term**: "Show a success toast" or "The error toast says..."

### Drawer
A panel that slides in from the side of the screen (like a drawer opening).
- **Example in our app**: Cart drawer, Favorites drawer, Layers panel
- **When to use term**: "Open the cart drawer" or "The layers drawer is stuck"

### Sidebar
A fixed panel on the left or right side of the page.
- **Example in our app**: The left toolbar with icons (Upload Image, Text, My Library, etc.)
- **When to use term**: "The sidebar is not showing" or "Click the sidebar icon"

### Header/Navbar
The top bar of the website with navigation links and user profile.
- **Example in our app**: The top bar with logo, cart icon, favorites icon, login button
- **When to use term**: "The header is missing" or "The navbar shows my name"

### Button
A clickable element that triggers an action.
- **Example in our app**: Save, Preview, Add to Cart, Back
- **When to use term**: "Click the Save button" or "The button is disabled"

### Dropdown/Select
A clickable element that shows a list of options when clicked.
- **Example in our app**: Size selector (S, M, L, XL), Print Area dropdown
- **When to use term**: "Select from the dropdown" or "The size dropdown"

### Canvas
The drawing/design area where users can add and manipulate objects.
- **Example in our app**: The center area with the t-shirt mockup where you design
- **When to use term**: "Clear the canvas" or "Objects on the canvas"

---

## Application States

### Loading State
When the app is fetching data or processing something, showing a spinner or "Loading..." message.
- **When to use term**: "Stuck in loading state" or "Loading state not clearing"

### Error State
When something goes wrong and the app shows an error message.
- **When to use term**: "App is in error state" or "Error state not handled"

### Idle State
Normal state when the app is ready and waiting for user interaction.
- **When to use term**: "Return to idle state" or "App should be idle"

### Hydrating/Hydration
When the app is loading initial data (especially user authentication) on page load.
- **When to use term**: "Auth is still hydrating" or "Wait for hydration to complete"

---

## Frontend Terms

### Component
A reusable piece of UI (like a LEGO block).
- **Example in our app**: ProductCard, Header, AuthDialog, CartDrawer
- **When to use term**: "The ProductCard component" or "Create a new component"

### Hook
A React function that lets you use state and other features (starts with "use").
- **Example in our app**: useAuth, useCart, useFavorites, useFabricCanvas
- **When to use term**: "The useAuth hook" or "Call the hook"

### Props
Data passed from a parent component to a child component.
- **When to use term**: "Pass it as a prop" or "The props are missing"

### State
Data that can change over time in a component.
- **When to use term**: "Update the state" or "State is not syncing"

### Effect
Code that runs after the component renders (side effects).
- **When to use term**: "Add a useEffect" or "The effect is running too many times"

### Context
A way to share data across many components without passing props.
- **Example in our app**: AuthContext (shares user login info everywhere)
- **When to use term**: "Get from context" or "The context value is null"

### Route/Routing
Navigation between different pages/URLs in the app.
- **Example in our app**: "/" (home), "/custom-design", "/checkout"
- **When to use term**: "Navigate to the route" or "Route is not found"

---

## Backend Terms

### API/Endpoint
A URL on the backend server that accepts requests and returns data.
- **Example in our app**: `/api/design/save`, `/api/cart`, `/auth/me`
- **When to use term**: "Call the API endpoint" or "The endpoint is returning 500"

### Request
When the frontend asks the backend for something (GET, POST, PUT, DELETE).
- **When to use term**: "Send a POST request" or "The request failed"

### Response
What the backend sends back after a request.
- **When to use term**: "The response is 200 OK" or "Response has no data"

### Status Code
A number indicating the result of a request:
- **200-299**: Success (200 OK, 201 Created)
- **400-499**: Client error (400 Bad Request, 401 Unauthorized, 404 Not Found)
- **500-599**: Server error (500 Internal Server Error)
- **When to use term**: "Status code 401" or "Getting a 500 error"

### JSON
A format for sending data between frontend and backend (looks like JavaScript object).
- **When to use term**: "Response returns JSON" or "Parse the JSON"

### Cookie
Small piece of data stored in the browser, used for authentication.
- **Example in our app**: accessToken, refreshToken
- **When to use term**: "Check the cookies" or "Cookie not being sent"

### CORS
Security feature that controls which websites can access your API.
- **When to use term**: "CORS error" or "CORS is blocking the request"

---

## Database Terms

### Schema
The structure/blueprint of your database tables.
- **Example in our app**: Prisma schema defining User, UserCart, customizable_products
- **When to use term**: "Update the schema" or "Schema mismatch"

### Migration
Updating the database structure to match your schema changes.
- **When to use term**: "Run the migration" or "Migration failed"

### Query
A request to get or change data in the database.
- **When to use term**: "Run a query" or "Query is slow"

### Primary Key
A unique identifier for each row in a table (usually "id").
- **When to use term**: "Use the primary key" or "ID is the primary key"

### Foreign Key
A field that links to another table's primary key.
- **Example in our app**: userId in UserCart links to User table
- **When to use term**: "Foreign key constraint" or "Link via foreign key"

---

## Development Environment

### Frontend Server
The development server that serves your React app (usually port 3000).
- **When to use term**: "Frontend server is running" or "Restart the frontend"

### Backend Server
The API server that handles data/database (usually port 4000).
- **When to use term**: "Backend server is down" or "Backend not responding"

### Port
A number identifying a specific service on your computer.
- **Example**: Port 3000 (frontend), Port 4000 (backend), Port 3306 (MySQL)
- **When to use term**: "Port 4000 is in use" or "Change the port"

### Terminal/Console
The text-based interface where you run commands.
- **When to use term**: "Check the terminal" or "Run in the console"

### Browser Console
The developer tools in your browser showing logs and errors (F12).
- **When to use term**: "Check browser console" or "Console shows error"

### Environment Variables (.env)
Secret configuration values (API keys, database URLs) stored in .env files.
- **When to use term**: "Add to .env file" or "Environment variable missing"

---

## Common Issues & Terms

### "Connection Refused"
Backend server is not running or wrong port.
- **Fix**: Start the backend server

### "CORS Error"
Backend is blocking requests from your frontend domain.
- **Fix**: Check CORS settings in backend

### "401 Unauthorized"
User is not logged in or token expired.
- **Fix**: Log in again

### "404 Not Found"
The URL/route/file doesn't exist.
- **Fix**: Check the URL or create the route

### "500 Internal Server Error"
Something crashed on the backend.
- **Fix**: Check backend terminal for error logs

### "Timeout"
Request took too long and was cancelled.
- **Fix**: Check if backend is responding, increase timeout

### "Buffer/Buffering"
Waiting/loading indefinitely (spinner keeps spinning).
- **Fix**: Check loading state logic, add timeout

### "Hydration"
In React, when the app loads initial state from the server or API.
- **Fix**: Wait for hydration to complete before checking auth

---

## Our Project-Specific Terms

### Customizable Product
A product (t-shirt) that users can design on.

### Active Variant
The currently selected product variant (size, color, style) being designed.

### Canvas JSON
The Fabric.js canvas data saved as JSON (all design objects).

### Print Area
The designated area on the t-shirt where designs can be placed.

### Thumbnail
A small preview image of the design.

### My Library
The saved designs section for the logged-in user.

### Cloudinary
The image hosting service we use for uploads.

---

## Quick Communication Guide

### When Reporting a Problem:
1. **What were you trying to do?** (e.g., "I clicked Save")
2. **What happened?** (e.g., "Got stuck on loading modal")
3. **What did you expect?** (e.g., "Should save and show success toast")
4. **Any error messages?** (e.g., "Console shows 500 error")

### Common Phrases:
- "The modal is stuck" = Popup won't close
- "Getting a 401" = Not authenticated
- "Backend is down" = Server not responding
- "Console shows..." = Error in browser developer tools
- "State not updating" = UI not reflecting changes
- "API call failed" = Request to backend didn't work
- "Canvas won't load" = Design area not showing
- "Toast doesn't appear" = Notification not showing

---

## Tools to Debug

1. **Browser Console (F12)**: See JavaScript errors, logs, network requests
2. **Network Tab (F12 → Network)**: See all API calls, status codes, responses
3. **Backend Terminal**: See server logs, errors, requests received
4. **Frontend Terminal**: See build errors, warnings, Vite logs
5. **Prisma Studio**: Visual database viewer

---

*Keep this file handy when discussing issues - it'll help us communicate more effectively!*

# Admin Dashboard Logout Functionality

## Overview

The admin dashboard now includes logout functionality with confirmation dialogs and proper session management.

## Features

### 1. Dual Logout Buttons
- **Header Logout Button**: Located in the top-right header with text "Logout" (hidden on small screens)
- **Sidebar Logout Button**: Icon-only button in the sidebar footer next to admin user info

### 2. Confirmation Dialog
- Both logout buttons trigger a confirmation modal
- Prevents accidental logouts
- Shows loading state during logout process
- Can be cancelled by clicking "Cancel" or the X button

### 3. Session Management
- Uses NextAuth's `signOut()` function
- Redirects to `/login` page after logout
- Properly clears session data
- Works with both regular admin users and dedicated admin accounts

## Components

### LogoutButton Component
Located at: `src/components/admin/LogoutButton.tsx`

**Props:**
- `variant`: `'icon' | 'button'` - Controls button appearance
- `className`: Optional CSS classes
- `showText`: Boolean to show/hide text label

**Usage:**
```tsx
// Icon-only button (for sidebar)
<LogoutButton variant="icon" />

// Button with text (for header)
<LogoutButton />

// Custom styling
<LogoutButton className="custom-class" showText={false} />
```

### AdminLayout Updates
The `AdminLayout` component now includes:
- Logout buttons in both header and sidebar
- Dynamic admin user information display
- Proper role formatting and display

## Authentication Flow

### Current User Types
The system supports two types of admin users:

1. **Regular Users with ADMIN role** (backward compatibility)
   - Stored in `users` table with `role = 'ADMIN'`
   - Gets default admin permissions

2. **Dedicated Admin Users** (new system)
   - Stored in `admin_users` table
   - Has granular roles and permissions
   - Supports MFA and advanced security features

### Admin User Information
The layout displays:
- Admin name (first letter as avatar)
- Formatted role name (e.g., "Super Admin", "Moderator")
- Email address (in session)

## Security Features

### Logout Confirmation
- Prevents accidental logouts
- Shows clear confirmation message
- Provides cancel option

### Session Cleanup
- Properly clears NextAuth session
- Redirects to login page
- Prevents unauthorized access after logout

### Loading States
- Shows "Logging out..." during process
- Disables buttons during logout
- Prevents multiple logout attempts

## Testing

### Manual Testing
1. Login to admin dashboard
2. Verify logout buttons appear in header and sidebar
3. Click logout button
4. Confirm dialog appears
5. Click "Logout" to confirm
6. Verify redirect to login page
7. Try accessing admin pages (should redirect to login)

### Session Test Component
A test component is temporarily added to the dashboard (`AdminDashboardTest`) that shows:
- Current session status
- User information
- Authentication state

## Implementation Details

### NextAuth Integration
```tsx
import { signOut } from 'next-auth/react';

// Logout with redirect
await signOut({ callbackUrl: '/login' });
```

### Session Provider
The app is wrapped with `SessionProvider` in `src/components/providers.tsx`:
```tsx
<SessionProvider>
  {children}
</SessionProvider>
```

### Admin Authentication
Updated `src/lib/admin-auth.ts` to support both user types:
- Checks regular users table first (backward compatibility)
- Falls back to admin_users table for dedicated admin accounts
- Returns unified admin user interface

## Styling

### Design System
- Uses consistent color scheme (red for logout actions)
- Hover states for better UX
- Dark mode support
- Responsive design (text hidden on small screens)

### CSS Classes
- `hover:text-red-600` - Red text on hover
- `hover:bg-red-50` - Light red background on hover
- `dark:hover:text-red-400` - Dark mode red text
- `dark:hover:bg-red-900/20` - Dark mode red background

## Future Enhancements

### Potential Improvements
1. **Session Timeout Warning**: Warn users before session expires
2. **Multiple Device Logout**: Option to logout from all devices
3. **Logout Audit Logging**: Log logout events for security
4. **Remember Me**: Option to extend session duration
5. **Logout Redirect Options**: Allow custom redirect URLs

### Security Enhancements
1. **Force Logout**: Admin ability to force logout other admins
2. **Session Monitoring**: Track active admin sessions
3. **Suspicious Activity**: Auto-logout on suspicious activity
4. **IP Restrictions**: Logout if IP changes significantly

## Troubleshooting

### Common Issues

**Logout button not working:**
- Check if SessionProvider is properly configured
- Verify NextAuth configuration
- Check browser console for errors

**Redirect not working:**
- Verify `/login` route exists
- Check NextAuth pages configuration
- Ensure proper middleware setup

**Session not clearing:**
- Check NextAuth secret configuration
- Verify cookie settings
- Clear browser cookies manually

**Confirmation dialog not showing:**
- Check for JavaScript errors
- Verify component imports
- Check z-index conflicts

### Debug Steps
1. Check browser console for errors
2. Verify session state with React DevTools
3. Check network requests during logout
4. Verify NextAuth configuration
5. Test with different browsers

## Best Practices

### UX Guidelines
- Always show confirmation for destructive actions
- Provide clear feedback during loading states
- Use consistent styling across the application
- Support keyboard navigation

### Security Guidelines
- Always redirect after logout
- Clear all session data
- Log security-relevant events
- Implement proper CSRF protection

### Code Guidelines
- Use TypeScript for type safety
- Handle errors gracefully
- Provide loading states
- Follow React best practices
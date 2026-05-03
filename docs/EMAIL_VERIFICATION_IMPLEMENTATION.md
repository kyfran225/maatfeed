# Email Verification Flow Implementation

## Summary

Implemented comprehensive email verification enforcement across the MAAT FEED application following best practices.

## What was implemented

### 1. Backend Middleware (`apps/api/src/middleware/auth.ts`)

#### `requireVerifiedEmail`
- New async middleware that checks both authentication AND email verification
- Returns **403 Forbidden** (not 401) with structured error:
  ```json
  {
    "error": "Email not verified",
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Veuillez vérifier votre adresse email...",
    "action": {
      "type": "RESEND_VERIFICATION",
      "endpoint": "/api/auth/resend-verification",
      "message": "Renvoyer l'email de vérification"
    }
  }
  ```

#### `optionalAuthWithVerification`
- Extends `optionalAuth` to also check and attach `isEmailVerified` status
- Useful for endpoints that work both authenticated and anonymously

### 2. Route Protection Matrix

| Endpoint | Previous | New |
|----------|----------|-----|
| `/api/profile` (GET) | `requireAuth` | `requireAuth` (read-only OK) |
| `/api/profile/preferences` | `requireAuth` | `requireVerifiedEmail` |
| `/api/profile/avatar` | `requireAuth` | `requireVerifiedEmail` |
| `/api/profile/complete-onboarding` | `requireAuth` | `requireVerifiedEmail` |
| `/api/interactions/like` | `optionalAuth` | `requireVerifiedEmail` |
| `/api/interactions/save` | `optionalAuth` | `requireVerifiedEmail` |
| `/api/interactions/share` | `optionalAuth` | `requireVerifiedEmail` |
| `/api/interactions/watch` | `optionalAuth` | `requireVerifiedEmail` |
| `/api/comments/:contentId` (POST) | `requireAuth` | `requireVerifiedEmail` |
| `/api/comments/:commentId/like` | `requireAuth` | `requireVerifiedEmail` |
| `/api/comments/:commentId/report` | `requireAuth` | `requireAuth` (intentionally) |
| `/api/comments/replies` | `requireAuth` | `requireVerifiedEmail` |

**Note:** Reporting endpoints remain `requireAuth` (not `requireVerifiedEmail`) because users should be able to report abuse even without verification.

### 3. Frontend Error Handling (`apps/web/src/services/httpClient.ts`)

#### `EmailVerificationRequiredError` class
- Custom error class with `code = "EMAIL_NOT_VERIFIED"`
- Includes action metadata for UI handling

#### Error handling in `getJson` and `postJson`
- Detects 403 + `EMAIL_NOT_VERIFIED` code
- Throws `EmailVerificationRequiredError` instead of generic Error
- Existing 401 handling unchanged (redirects to /auth)

### 4. UI Components

#### `EmailVerificationSheet` (`apps/web/src/components/auth/EmailVerificationSheet.tsx`)
- New slide-up sheet similar to `AuthRequiredSheet`
- Shows when user attempts action requiring verification
- Includes "Renvoyer l'email" button with loading state
- Success/error message display

#### Updated `EnhancedFeedCard` (`apps/web/src/components/feed/EnhancedFeedCard.tsx`)
- Added `showEmailVerification` state
- Updated `requireAuthOr()` to accept `requireVerified` parameter (default true)
- Added `handleInteractionError()` to catch `EmailVerificationRequiredError`
- Like/Save/Share mutations handle errors and show email verification sheet
- Comments also require verification

#### Updated `ProfilePage` (`apps/web/src/pages/ProfilePage.tsx`)
- Avatar update now catches `EmailVerificationRequiredError`
- Shows `EmailVerificationSheet` when needed
- Error display in photo modal

## Permission Matrix for Unverified Users

| Action | Allowed | UX Behavior |
|--------|---------|-------------|
| Browse global feed | ✅ | Full access |
| View comments | ✅ | Read-only |
| Like content | ❌ | Shows EmailVerificationSheet |
| Save content | ❌ | Shows EmailVerificationSheet |
| Share content | ❌ | Shows EmailVerificationSheet |
| Comment/Reply | ❌ | Shows EmailVerificationSheet |
| Update avatar | ❌ | Shows EmailVerificationSheet |
| Update preferences | ❌ | Shows EmailVerificationSheet |
| Complete onboarding | ❌ | Shows EmailVerificationSheet |
| Report content | ✅ | Allowed (moderation need) |
| View profile | ✅ | Read-only |
| View saved content | ✅ | Read-only |

## Technical Details

### Error Response Structure
```typescript
// 403 Forbidden
{
  error: "Email not verified",
  code: "EMAIL_NOT_VERIFIED",
  message: "Localized user message",
  action: {
    type: "RESEND_VERIFICATION",
    endpoint: "/api/auth/resend-verification",
    message: "Renvoyer l'email de vérification"
  }
}
```

### Frontend Error Handling Pattern
```typescript
// Service calls throw EmailVerificationRequiredError
try {
  await updateAvatar({ avatar: selectedAvatar });
} catch (error) {
  if (error instanceof EmailVerificationRequiredError) {
    setShowEmailVerification(true);
  }
}
```

## Files Modified

### Backend
- `apps/api/src/middleware/auth.ts` - Added `requireVerifiedEmail` and `optionalAuthWithVerification`
- `apps/api/src/routes/profileRoutes.ts` - Updated route protection
- `apps/api/src/routes/interactionRoutes.ts` - Updated route protection
- `apps/api/src/routes/commentRoutes.ts` - Updated route protection

### Frontend
- `apps/web/src/services/httpClient.ts` - Added `EmailVerificationRequiredError` and error handling
- `apps/web/src/components/feed/EnhancedFeedCard.tsx` - Added verification handling
- `apps/web/src/pages/ProfilePage.tsx` - Added verification handling

### New Files
- `apps/web/src/components/auth/EmailVerificationSheet.tsx` - New UI component

## Testing Recommendations

1. **Register new user** → Verify email banner appears
2. **Try to like content** → EmailVerificationSheet should appear
3. **Try to update avatar** → EmailVerificationSheet should appear
4. **Verify email** → All actions should work normally
5. **Check reporting still works** → Should work without verification
6. **Check feed still loads** → Should work anonymously

## Build Status

- ✅ `npm --workspace @maat/api run build` - Passes
- ✅ `npm --workspace @maat/web run build` - Passes

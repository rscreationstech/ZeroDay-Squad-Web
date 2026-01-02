# Delete User Edge Function

## Purpose
Securely delete a user and all related data from the system. Admin-only operation.

## Deployment
Deploy this function using:
```bash
supabase functions deploy delete-user
```

## Environment Variables Required
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_ANON_KEY` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

## How It Works
1. Verifies the calling user is authenticated
2. Checks if the calling user has admin role
3. Prevents admins from deleting themselves
4. Deletes the target user using `auth.admin.deleteUser()`
5. Cascading deletes handle related data automatically:
   - `user_roles` (ON DELETE CASCADE from auth.users)
   - `profiles` (ON DELETE CASCADE from auth.users)
   - `project_members` (ON DELETE CASCADE from profiles)
   - `achievement_members` (ON DELETE CASCADE from profiles)

## API

**Endpoint:** `https://<project-ref>.supabase.co/functions/v1/delete-user`

**Method:** POST

**Headers:**
- `Authorization: Bearer <user-access-token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "userId": "<uuid-of-user-to-delete>"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- 401: No/invalid authorization
- 403: User is not an admin
- 400: Missing userId or trying to delete self
- 500: Deletion failed

## Testing Locally
```bash
supabase functions serve delete-user
```

Then call:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/delete-user' \
  --header 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"<USER_ID_TO_DELETE>"}'
```

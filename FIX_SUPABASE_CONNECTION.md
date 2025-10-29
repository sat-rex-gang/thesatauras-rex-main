# Fix Supabase Connection String for Netlify

## Error: "FATAL: Tenant or user not found"

This error means the DATABASE_URL format is incorrect for Supabase's connection pooler.

## Solution: Get the Correct Connection String

### Option 1: Use Session Pooler (Recommended for Netlify)

1. Go to your Supabase Dashboard
2. Project Settings → **Database**
3. Scroll to **"Connection string"** section
4. Make sure:
   - **Source**: Your project
   - **Mode**: **Session** (not Direct)
   - **Method**: **Pooler connection**
5. Copy the connection string from the **"URI"** tab
6. Format should be:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

### Option 2: Use Transaction Pooler

1. Same steps as above
2. Select **"Transaction"** mode instead of Session
3. Copy the URI connection string
4. Format:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
   ```

### Important Notes:

- **Username format**: Must be `postgres.[PROJECT-REF]` (not just `postgres`)
- **For Pooler**: Use port `6543` (Session) or `5432` (Transaction)
- **For Direct**: Use port `5432` but might have IPv6 issues

## Step-by-Step Fix:

1. In Supabase Dashboard → Project Settings → Database
2. Go to "Connection string" section
3. Select:
   - **Source**: Your project name
   - **Mode**: **Session** (for serverless/Netlify)
   - **Method**: **Pooler connection**
4. Copy the **URI** connection string
5. It should look like:
   ```
   postgresql://postgres.sadglfqeyogcumoeikhh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual password: `AORo5B20fJKjopBC`
7. Final string:
   ```
   postgresql://postgres.sadglfqeyogcumoeikhh:AORo5B20fJKjopBC@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
8. Set it in Netlify:
   ```powershell
   netlify env:set DATABASE_URL "postgresql://postgres.sadglfqeyogcumoeikhh:AORo5B20fJKjopBC@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

## Verify:

After setting, your connection string should have:
- ✅ Username: `postgres.sadglfqeyogcumoeikhh` (with project ref)
- ✅ Host: `aws-0-us-east-1.pooler.supabase.com`
- ✅ Port: `6543` (Session) or `5432` (Transaction)
- ✅ Password: Your actual password (not `[YOUR-PASSWORD]`)


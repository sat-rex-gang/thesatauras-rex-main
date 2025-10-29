# Get Correct Supabase Connection String for Netlify

## Steps:

1. **In the Supabase modal you have open**, change the dropdown settings:
   - **Method**: Change from "Direct connection" to **"Pooler connection"** or **"Session"**

2. **Select Session Mode** (this is IPv4 compatible):
   - Look for a dropdown or section that says "Session" or "Session Pooler"
   - This should be IPv4 compatible (no warning)

3. **Copy the connection string** that appears - it should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   Or:
   ```
   postgresql://postgres.sadglfqeyogcumoeikhh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

4. **Replace `[YOUR-PASSWORD]`** with your actual password: `AORo5B20fJKjopBC`

5. **Set it in Netlify**:
   ```powershell
   netlify env:set DATABASE_URL "postgresql://postgres.sadglfqeyogcumoeikhh:AORo5B20fJKjopBC@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

## Key Differences:

- **Direct connection** (what you're seeing now):
  - Host: `db.xxxxx.supabase.co`
  - Port: `5432`
  - Username: `postgres` (simple)
  - ❌ Not IPv4 compatible (wont work on Netlify)
  
- **Session Pooler** (what you need):
  - Host: `aws-0-[REGION].pooler.supabase.com`
  - Port: `6543`
  - Username: `postgres.[PROJECT-REF]` (with project ref)
  - ✅ IPv4 compatible (works on Netlify)

## If you can't find Session Pooler:

Look for:
- A "Pooler settings" button (mentioned in the warning)
- Or try changing the "Method" dropdown to find pooler options
- Or check the tabs - maybe there's a "Connection pooling" section


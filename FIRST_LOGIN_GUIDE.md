# How to Sign In - First Time Setup

Since registration is now **admin-only**, you need to create the first admin account before you can sign in.

## Quick Setup (Recommended)

### Step 1: Make sure MongoDB is running
```powershell
# Check if MongoDB is running
sc query MongoDB

# If not running, start it:
net start MongoDB
```

### Step 2: Create the first admin account
Open a terminal in the `backend` folder and run:

```bash
cd backend
npm run create-admin
```

This will create an admin user with:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `Admin`

### Step 3: Start the servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Sign In

1. Open your browser: `http://localhost:3000`
2. You'll see the login page
3. Enter:
   - **Username**: `admin`
   - **Password**: `admin123`
4. Click "Sign In"
5. You'll be redirected to the dashboard!

### Step 5: Change the password (Important!)

After logging in, you should:
1. Go to Settings (or create a password change feature)
2. Change the default password to something secure

---

## Alternative Methods

### Option 2: Temporarily Allow Public Registration

If you prefer to create the admin via the frontend:

1. **Edit** `backend/routes/authRoutes.js`:
   ```javascript
   // Comment out the admin-only restriction
   // router.post('/signup', verifyToken, requireAdmin, authController.signup);
   router.post('/signup', authController.signup);
   ```

2. **Start backend** and **frontend**

3. **Go to** `http://localhost:3000/register`

4. **Create account** with:
   - Username: `admin`
   - Password: (your choice)
   - Role: Select `Admin`

5. **Re-enable admin-only restriction** in `authRoutes.js`:
   ```javascript
   router.post('/signup', verifyToken, requireAdmin, authController.signup);
   ```

### Option 3: Via MongoDB Shell

1. **Open MongoDB shell:**
   ```bash
   mongosh
   ```

2. **Switch to database:**
   ```javascript
   use graduation_project
   ```

3. **Hash a password** (you'll need to use Node.js or an online bcrypt tool):
   ```javascript
   // In Node.js REPL or create a quick script
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your_password', 10);
   console.log(hash);
   ```

4. **Insert admin user:**
   ```javascript
   db.users.insertOne({
     username: "admin",
     passwordHash: "<paste_hashed_password_here>",
     role: "Admin"
   })
   ```

---

## After First Login

Once you're logged in as admin, you can:

1. **Create more users:**
   - Go to `/users` page (admin-only)
   - Click "Add User" or go to `/register`
   - Create Operator accounts for your team

2. **Manage the system:**
   - Full access to all features
   - Can create/edit/delete users
   - Can manage cameras and events

---

## Troubleshooting

### "Admin user already exists"
- The admin account was already created
- Try logging in with username: `admin`, password: `admin123`
- Or check MongoDB to see existing users

### "MongoDB connection error"
- Make sure MongoDB service is running
- Check connection string in `.env` or `server.js`

### "Cannot find module" errors
- Make sure you're in the `backend` folder
- Run `npm install` if needed

### Forgot the password?
- Delete the admin user from MongoDB and run the script again
- Or use MongoDB to update the passwordHash

---

## Security Note

⚠️ **Important**: The default password `admin123` is not secure! Change it immediately after first login.

# Quick Start Guide - VerifyFlow

## 🚀 Get Started in 3 Minutes

### Step 1: Installation (1 minute)

```bash
# Navigate to the project
cd verifyflow

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at **http://localhost:3000**

### Step 2: Test the Application (2 minutes)

1. **Open your browser** to http://localhost:3000

2. **Upload a CSV file**:

   - Use the provided sample: `public/sample-emails.csv`
   - Or create your own CSV with an email column

3. **Click "Start Verification"**:

   - Watch the real-time progress bar
   - See batch processing updates
   - View status counters update live

4. **Download Results**:
   - Click "Download Results (CSV)"
   - Check the verification_status column
   - Start a new verification if needed

### Step 3: Try Dark Mode

Click the theme toggle button (🌙/☀️) in the top-right corner!

## 📝 Creating Test CSV Files

### Basic Format

```csv
email
test@example.com
user@domain.com
invalid-email
```

### With Additional Columns

```csv
email,name,company
john@example.com,John Doe,Acme Corp
jane@test.com,Jane Smith,Tech Inc
```

## 🎯 Expected Results

### Valid Emails

- Format: `user@domain.com`
- Status: `VALID`

### Disposable Emails

- Examples: `test@tempmail.com`, `user@10minutemail.com`
- Status: `DISPOSABLE`

### Invalid Emails

- Examples: `invalid-email`, `user@`, `@domain.com`
- Status: `INVALID_FORMAT`

### API Errors

- Network issues or API downtime
- Status: `API_ERROR_UNVERIFIED`

## 🔧 Troubleshooting

### Port Already in Use?

```bash
# Change the port
PORT=3001 npm run dev
```

### Build Errors?

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript Errors?

```bash
# Check for errors
npx tsc --noEmit
```

## 📦 Project Structure

```
verifyflow/
├── app/                    # Next.js App Router
│   ├── api/verify/        # API endpoints
│   └── page.tsx           # Main page
├── components/            # React components
├── lib/                   # Business logic
│   ├── services/         # Job & verification
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
└── public/               # Static files
```

## 🎨 Key Features to Test

1. **File Upload**

   - Drag & drop
   - Click to browse
   - Error handling

2. **Processing**

   - Real-time progress
   - Batch updates
   - Status counters

3. **Download**

   - CSV generation
   - File download
   - Start new verification

4. **Dark Mode**

   - Toggle theme
   - Persistent storage
   - Smooth transitions

5. **Responsive Design**
   - Test on mobile (F12 → Device Toolbar)
   - Resize browser window
   - Check all breakpoints

## 📊 API Testing

### Using cURL

**Upload**:

```bash
curl -X POST http://localhost:3000/api/verify/upload \
  -F "file=@sample-emails.csv"
```

**Start**:

```bash
curl -X POST http://localhost:3000/api/verify/start \
  -H "Content-Type: application/json" \
  -d '{"jobId":"YOUR_JOB_ID"}'
```

**Progress**:

```bash
curl http://localhost:3000/api/verify/progress?jobId=YOUR_JOB_ID
```

**Download**:

```bash
curl http://localhost:3000/api/verify/download?jobId=YOUR_JOB_ID > results.csv
```

## 🎓 Learning Path

1. **Start with the UI** (`app/page.tsx`)
2. **Explore main component** (`components/EmailVerifier.tsx`)
3. **Check API routes** (`app/api/verify/*/route.ts`)
4. **Understand services** (`lib/services/`)
5. **Review types** (`lib/types/index.ts`)

## 🐛 Common Issues

### Issue: "Module not found"

**Solution**: Restart the dev server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Dark mode not persisting

**Solution**: Check localStorage in DevTools

```javascript
// Console:
localStorage.getItem('theme');
```

### Issue: Upload fails

**Solution**: Check file size (max 5MB) and format (.csv)

### Issue: Progress stuck

**Solution**: Check API endpoint in Network tab (F12)

## 🎉 You're Ready!

The application is now running and ready to verify email lists.

**Happy Verifying! 🚀**

---

For detailed documentation, see:

- `README.md` - Full documentation
- `PROJECT_SUMMARY.md` - Implementation details

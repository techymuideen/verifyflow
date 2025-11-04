# VerifyFlow - Rapid Email List Verifier

A modern, full-stack email verification application built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## 🚀 Features

- **3-Step Verification Flow**: Upload → Process → Download
- **Batch Processing**: Verifies up to 100 emails per batch with 500ms delay between batches
- **Real-Time Progress**: Live updates with progress bars and status counters
- **Dark Mode**: Persistent theme switching with localStorage
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type-Safe**: Fully typed with TypeScript - no `any` types
- **Modern UI**: Beautiful interface with Lucide React icons
- **CSV Support**: Easy upload and download of verification results

## 📋 Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**
- **Lucide React** (Icons)

### Backend (API Routes)

- **Next.js API Routes**
- **csv-parse** & **csv-stringify**
- **axios** (HTTP client)
- **uuid** (Job ID generation)

## 🏗️ Project Structure

```
verifyflow/
├── app/
│   ├── api/verify/          # API endpoints
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/              # React components
├── lib/
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── services/           # Business logic
└── public/
```

## 🔧 Installation & Setup

1. **Install dependencies**

```bash
npm install
```

2. **Run the development server**

```bash
npm run dev
```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Usage

### Step 1: Upload

- Drag and drop a CSV file or click to browse
- File must be `.csv` format with max size of 5MB
- Click "Start Verification" to proceed

### Step 2: Process

- Real-time progress updates
- Live status counters for VALID, DISPOSABLE, INVALID, and ERROR emails
- Batch information shows current processing status

### Step 3: Download

- Download verified results as CSV
- Original columns preserved with verification status added
- Start new verification or download results

## 📊 CSV Format

### Input Example

```csv
email,name,company
john@example.com,John Doe,Acme Corp
jane@disposable.com,Jane Smith,Tech Inc
```

### Output Example

```csv
email,name,company,verification_status,verified_email
john@example.com,John Doe,Acme Corp,VALID,john@example.com
jane@disposable.com,Jane Smith,Tech Inc,DISPOSABLE,jane@disposable.com
```

## 🔌 API Endpoints

- `POST /api/verify/upload` - Upload CSV file
- `POST /api/verify/start` - Start verification
- `GET /api/verify/progress` - Get job progress
- `GET /api/verify/download` - Download results

## 🛠️ Development

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🎯 Key Features

- **Zero `any` types** - Fully type-safe TypeScript
- **Batch processing** - 100 emails per batch with 500ms delay
- **Real-time updates** - Polling every 2 seconds
- **Dark mode** - Persistent theme with localStorage
- **Responsive** - Works on all screen sizes

## 🚦 Status Types

| Status                 | Description                    |
| ---------------------- | ------------------------------ |
| `VALID`                | Email is valid and deliverable |
| `DISPOSABLE`           | Temporary/disposable email     |
| `INVALID_FORMAT`       | Incorrect email format         |
| `API_ERROR_UNVERIFIED` | Verification failed            |

## 📦 Dependencies

- `next@16.0.1` - React framework
- `react@19.2.0` - UI library
- `typescript@^5` - Type safety
- `tailwindcss@^4` - Styling
- `csv-parse` & `csv-stringify` - CSV handling
- `axios` - HTTP client
- `uuid` - ID generation
- `lucide-react` - Icons

## 📄 License

MIT License

---

**Built with ❤️ using Next.js 16, React 19, and TypeScript**

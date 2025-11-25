# 🎯 Snatchbase

**Powerful stealer log aggregation and threat intelligence platform**

Modern web application for ingesting, analyzing, and searching through stealer malware logs. Built with FastAPI, React, and PostgreSQL for security researchers and threat intelligence teams.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

---

## ✨ Features

### 🔍 Advanced Search & Filtering
- **Multi-field search** across credentials, domains, usernames, and browsers
- **Real-time filtering** by stealer family, TLD, country, and more
- **Pagination & sorting** for large datasets
- **Export capabilities** for analysis

### 📊 Analytics & Intelligence
- **Interactive dashboards** with real-time statistics
- **Stealer family tracking** - Monitor Lumma, RedLine, Raccoon, and 50+ others
- **Geographic distribution** of compromised systems
- **Top domains & passwords** analysis
- **Browser & software statistics**

### 🚀 Automated Ingestion
- **Auto-watch directory** - Monitors `backend/data/incoming/uploads/` for new uploads
- **ZIP archive support** - Automatic extraction (unencrypted archives only)
- **Batch processing** - Process multiple archives with progress tracking
- **Duplicate detection** - Prevents re-ingestion of the same data
- **Intelligent structure detection** - Handles various stealer log formats

### 💎 Modern UI/UX
- **Beautiful dark theme** with gradient effects
- **Smooth animations** powered by Framer Motion
- **Responsive design** for all screen sizes
- **Intuitive navigation** and search experience
- **Real-time updates** and loading states

---

## 🏗️ Architecture

### Version 2.0 - Modular Service Architecture

Snatchbase now uses a **service-oriented architecture** for improved reliability and maintainability:

- **Independent Services**: Each component runs in its own process
- **Fault Isolation**: Service failures don't crash the entire application
- **Health Monitoring**: Automatic health checks and restart on failure
- **Easy Scaling**: Services can be scaled independently
- **Simple Management**: Control all services with `snatchctl` CLI tool

**Services:**
- **API Service** - FastAPI web server (port 8000)
- **Telegram Bot Service** - Bot for search and analytics
- **File Watcher Service** - Monitors and ingests ZIP files
- **Wallet Checker Service** - Checks cryptocurrency balances

See `ARCHITECTURE_V2.md` for complete architectural details.

### Backend Stack
- **FastAPI** - High-performance async Python web framework (v2.0.0)
- **SQLAlchemy** - ORM with PostgreSQL/SQLite support
- **Uvicorn** - ASGI server for production deployment
- **Watchdog** - File system monitoring for auto-ingestion
- **Service Manager** - Process supervision and health monitoring
- **Custom parsers** - Passwords.txt, System.txt, Software.txt

### Frontend Stack
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite 4** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client for API calls
- **React Router v6** - Client-side routing

### Integration
- **Proxy Configuration** - Vite proxies `/api` requests to backend
- **CORS Enabled** - Backend accepts cross-origin requests
- **Consistent API** - All endpoints under `/api` prefix
- **Type Safety** - TypeScript types match backend schemas

See `FRONTEND_INTEGRATION.md` for frontend-backend sync details.

### Database Schema
- **Devices** - Compromised systems with hardware info
- **Credentials** - Stolen passwords and authentication data
- **Relationships** - Foreign keys linking credentials to devices
- **Indexes** - Optimized for fast searching

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **PostgreSQL** (optional, SQLite works for development)

### Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/sinikiano/Snatchbase.git
cd Snatchbase

# 2. Start everything (auto-installs dependencies, sets up DB)
./start.sh
```

That's it! The start script will:
- ✅ Create Python virtual environment
- ✅ Install backend dependencies
- ✅ Set up SQLite database
- ✅ Start API server on http://localhost:8000
- ✅ Install frontend dependencies
- ✅ Start frontend on http://localhost:3000

### Ingesting Data

Drop ZIP files containing stealer logs into:
```bash
backend/data/incoming/uploads/
```

Then run manual ingestion:
```bash
cd backend
source venv/bin/activate
python manual_ingest.py
```

The script will process all ZIPs and show statistics.

---

## 📖 Usage Guide

### Dashboard
The main dashboard provides an overview of your threat intelligence data:
- **Statistics cards** - Total credentials, devices, domains, and stealer families
- **Quick actions** - Jump to search, devices, or analytics
- **Recent devices** - Latest compromised systems with click-through details

### Search & Filter
Advanced search capabilities for finding specific intelligence:
1. Navigate to **Search** page
2. Use the search bar for general queries
3. Apply filters:
   - **Domain** - Filter by specific domains (e.g., gmail.com)
   - **Username** - Search by email or username
   - **Browser** - Filter by browser type (Chrome, Firefox, etc.)
   - **Stealer** - Filter by malware family (Lumma, RedLine, etc.)
   - **TLD** - Filter by top-level domain (.com, .org, etc.)
4. Click on credentials to view full details
5. Navigate to device pages to see all credentials from that system

### Device Details
View comprehensive information about compromised systems:
- **System information** - OS, hardware, location
- **All credentials** from that device
- **Stealer family** that compromised the system
- **Timestamps** and infection metadata

### Analytics
Deep dive into your threat intelligence:
- **Top browsers** - Most targeted applications
- **Top TLDs** - Most compromised domain extensions
- **Stealer families** - Distribution of malware families
- **Most common passwords** - Password analysis
- **Statistics trends** - Overall metrics

---

## 🔌 API Reference

### Core Endpoints

#### Statistics
```http
GET /stats
```
Returns overall database statistics including total credentials, devices, domains, and stealer families.

#### Search Credentials
```http
GET /search/credentials?q=gmail&domain=gmail.com&stealer=Lumma&limit=50&offset=0
```
**Query Parameters:**
- `q` - General search query
- `domain` - Filter by domain
- `username` - Filter by username
- `browser` - Filter by browser
- `stealer_name` - Filter by stealer family
- `tld` - Filter by TLD
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

#### Get Devices
```http
GET /devices?limit=20&offset=0
```
Returns paginated list of compromised devices.

#### Get Device Details
```http
GET /devices/{device_id}
```
Returns detailed information about a specific device.

#### Get Device Credentials
```http
GET /devices/{device_id}/credentials?limit=50&offset=0
```
Returns all credentials associated with a device.

#### Analytics Endpoints
```http
GET /stats/browsers?limit=20    # Top browsers
GET /stats/tlds?limit=20         # Top TLDs
GET /stats/stealers?limit=20     # Stealer families
GET /stats/passwords?limit=20    # Common passwords
GET /stats/domains?limit=20      # Top domains
GET /stats/countries?limit=20    # Country distribution
```

### Example Usage

**Python:**
```python
import requests

# Search for Gmail credentials
response = requests.get(
    'http://localhost:8000/search/credentials',
    params={'domain': 'gmail.com', 'limit': 100}
)
credentials = response.json()

# Get device details
device_id = credentials['results'][0]['device_id']
device = requests.get(f'http://localhost:8000/devices/{device_id}').json()
```

**cURL:**
```bash
# Get statistics
curl http://localhost:8000/stats

# Search credentials
curl "http://localhost:8000/search/credentials?q=paypal&limit=10"

# Get stealer family stats
curl http://localhost:8000/stats/stealers?limit=20
```

---

## 📁 Project Structure

```
snatchbase/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app & routes
│   │   ├── database.py             # Database configuration
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── schemas.py              # Pydantic schemas
│   │   ├── data/
│   │   │   └── stealer_names.txt   # 50+ stealer families
│   │   └── services/
│   │       ├── auto_ingest.py      # Auto-watch ingestion
│   │       ├── password_parser.py  # Passwords.txt parser
│   │       ├── system_parser.py    # System.txt parser
│   │       ├── software_parser.py  # Software.txt parser
│   │       ├── search_service.py   # Search & analytics
│   │       └── zip_processor.py    # Archive handling
│   ├── requirements.txt
│   ├── setup_db.sh                 # Database setup script
│   └── .env                        # Environment config
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   └── CredentialCard.tsx  # Credential display
│   │   ├── pages/
│   │   │   ├── DashboardSimple.tsx # Main dashboard
│   │   │   ├── SearchNew.tsx       # Search interface
│   │   │   ├── DevicesPage.tsx     # Device list
│   │   │   ├── DeviceDetail.tsx    # Device details
│   │   │   ├── AnalyticsNew.tsx    # Analytics page
│   │   │   └── ApiDocs.tsx         # API documentation
│   │   ├── services/
│   │   │   └── api.ts              # API client
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🛠️ Development

### Adding New Features

**Backend:**
1. Add models in `app/models.py`
2. Create schemas in `app/schemas.py`
3. Implement service logic in `app/services/`
4. Add routes in `app/main.py`

**Frontend:**
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update API service in `src/services/api.ts`
4. Add routes in `App.tsx`

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 🔒 Security & Privacy

### Important Considerations
- **Sensitive Data**: Stealer logs contain real credentials and personal information
- **Legal Compliance**: Ensure you have proper authorization to handle this data
- **Access Control**: Implement authentication before deploying to production
- **Data Encryption**: Consider encrypting the database at rest
- **Network Security**: Always use HTTPS in production environments
- **Audit Logging**: Track who accesses what data

### Recommended Production Setup
1. Enable authentication (JWT tokens)
2. Use PostgreSQL instead of SQLite
3. Enable HTTPS with valid certificates
4. Implement rate limiting
5. Set up proper logging and monitoring
6. Regular security audits

---

## 📄 License

This project is for **educational and research purposes only**. 

⚠️ **Warning**: Stealer logs contain sensitive personal information. Handle responsibly and in accordance with applicable laws and regulations. The authors are not responsible for misuse of this software.

---

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide Icons** - Beautiful icon set
- Security research community for threat intelligence insights

---

## 📧 Contact

For questions, issues, or contributions, please open an issue on GitHub.

**Built with ❤️ for the security research community**

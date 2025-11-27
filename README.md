# Snatchbase

Open-source stealer log aggregation and analysis platform for security research and threat intelligence.

Web application for ingesting, analyzing, and searching stealer malware logs. Built with FastAPI, React, and PostgreSQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

---

## Status

This is an active development project. The codebase is functional but contains technical debt and requires ongoing cleanup and optimization.

### Known Issues
- UI performance needs optimization for large datasets
- File browser requires refactoring
- Parser compatibility with additional stealer formats is incomplete

### Completed Features
- ZIP and RAR archive ingestion (including password-protected archives)
- Credential, device, and system information extraction
- Credit card and cryptocurrency wallet parsing
- Browser history tracking
- Multi-field search with filtering
- Geographic and stealer family analytics
- RESTful API with comprehensive endpoints

---

## Features

### Data Ingestion
- Automated processing of ZIP and RAR archives
- Password-protected archive support via configurable password list
- Batch processing with duplicate detection
- Support for nested archive structures
- Intelligent stealer log format detection

### Search and Analysis
- Multi-field search across credentials, domains, usernames
- Filtering by stealer family, TLD, country, browser type
- Export capabilities for external analysis
- Pagination for large result sets

### Analytics
- Real-time statistics dashboards
- Stealer family distribution tracking (50+ families)
- Geographic distribution of compromised systems
- Browser and software statistics
- Password frequency analysis

### UI
- Dark theme interface
- Responsive design
- Device detail views with comprehensive metadata
- Credit card and wallet management pages

---

## Architecture

### Backend
- **FastAPI** - Async Python web framework
- **SQLAlchemy** - ORM with PostgreSQL
- **Uvicorn** - ASGI server
- **Watchdog** - File system monitoring
- **Custom parsers** - Passwords.txt, System.txt, Software.txt, wallet data

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Database Schema
- Devices table with hardware and system information
- Credentials table with authentication data
- Credit cards table with payment information
- Wallets table for cryptocurrency data
- Browser history table
- File metadata table
- Foreign key relationships with proper indexing

---

## Installation

### Requirements
- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL database

### Setup

```bash
# Clone repository
git clone https://github.com/sinikiano/Snatchbase.git
cd Snatchbase

# Start services (handles dependency installation and database setup)
./start.sh
```

The start script will:
- Create Python virtual environment
- Install backend dependencies
- Configure PostgreSQL database
- Start API server on http://localhost:8000
- Install frontend dependencies
- Start frontend on http://localhost:3000

### Configuration

Database configuration in `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost/snatchbase
```

Password list for encrypted archives in `backend/passwords.txt` (one password per line, comments start with #).

---

## Usage

### Data Ingestion

Place ZIP or RAR files containing stealer logs in:
```
backend/data/incoming/uploads/
```

Run manual ingestion:
```bash
cd backend
source venv/bin/activate
python manual_ingest.py
```

The script processes all archives and outputs statistics. For RAR files, extraction is optimized by expanding to a temporary directory first to avoid repeated external process calls (significant performance improvement over file-by-file extraction).

### API Access

API documentation available at http://localhost:8000/docs

Key endpoints:

**Statistics**
```
GET /api/stats
```

**Search**
```
GET /api/search/credentials?q=query&domain=example.com&limit=50&offset=0
```

**Devices**
```
GET /api/devices?limit=20&offset=0
GET /api/devices/{id}
GET /api/devices/{id}/credentials
GET /api/devices/{id}/credit-cards
GET /api/devices/{id}/wallets
GET /api/devices/{id}/cookies
GET /api/devices/{id}/history
GET /api/devices/{id}/software
```

**Analytics**
```
GET /api/stats/browsers?limit=20
GET /api/stats/tlds?limit=20
GET /api/stats/stealers?limit=20
GET /api/stats/passwords?limit=20
GET /api/stats/credit-cards
GET /api/stats/wallets
```

---

## Project Structure

```
snatchbase/
├── backend/
│   ├── app/
│   │   ├── routers/          # API endpoint definitions
│   │   ├── services/         # Business logic
│   │   ├── models.py         # Database models
│   │   ├── database.py       # Database configuration
│   │   └── main.py           # FastAPI application
│   ├── passwords.txt         # Archive password list
│   ├── manual_ingest.py      # Manual ingestion script
│   ├── reset_database.py     # Database reset utility
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Development

### Database Reset

To drop and recreate all tables (warning: deletes all data):
```bash
cd backend
source venv/bin/activate
python reset_database.py
```

Type 'YES' when prompted to confirm.

### Adding Features

Backend:
1. Define models in `app/models.py`
2. Create router in `app/routers/`
3. Implement service logic in `app/services/`
4. Register router in `app/main.py`

Frontend:
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update API client in `src/services/api.ts`
4. Add routes in `App.tsx`

---

## Security Considerations

This software handles sensitive stolen data. Legal and ethical considerations:

- Ensure proper authorization to handle and analyze stealer log data
- Implement authentication before production deployment
- Use HTTPS for all network communication
- Consider database encryption at rest
- Implement audit logging for data access
- Follow applicable laws and regulations regarding data handling
- Be aware of responsible disclosure requirements if live credentials are discovered

This project is intended for security research, threat intelligence, and educational purposes only.

---

## Performance Notes

### RAR Archive Processing
RAR files are extracted to a temporary directory before processing. This approach provides significant performance improvements over file-by-file extraction (which requires launching external unrar processes for each file). The temporary directory is automatically cleaned up after processing.

### Search Optimization
Database indexes are configured on frequently queried fields (device_id, domain, stealer_name, etc.) for improved search performance.

---

## License

MIT License. See LICENSE file for details.

This software is provided for educational and research purposes. The authors are not responsible for misuse. Handle sensitive data responsibly and in accordance with applicable laws.

---

## Contributing

Issues and pull requests are welcome. For major changes, open an issue first to discuss proposed modifications.

---

## Contact

Questions or issues: Open an issue on GitHub.

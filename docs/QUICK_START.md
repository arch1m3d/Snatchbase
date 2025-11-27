# Quick Start Guide

Version 2.0.0

---

## Starting Services

### Backend API
```bash
cd backend
source venv/bin/activate
python -m launcher.api_service
```

**Endpoint:** http://localhost:8000
**Documentation:** http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm run dev
```

**Endpoint:** http://localhost:5173

### Health Check
```bash
bash check_health.sh
```

### Database Statistics
```bash
cd backend
source venv/bin/activate
python db_stats.py
```

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| PROJECT_STATUS.md | System status and health metrics |
| PROJECT_STRUCTURE.md | Architecture and file organization |
| INNOVATION_ROADMAP.md | Feature planning and implementation guides |
| CREDIT_CARD_FEATURE.md | Credit card feature documentation |
| README.md | Project overview and installation |

---

## Current Capabilities

### Operational
- Backend API (27 endpoints across 6 routers)
- PostgreSQL database (9 tables)
- Credit card parsing and storage
- Cryptocurrency wallet tracking
- Browser history extraction
- Device metadata collection
- Credential search and filtering
- Telegram bot integration

### Requires Setup
- Frontend deployment (use `npm run dev`)
- Data ingestion (place archives in uploads directory)
- Password list configuration for encrypted archives

---

## Database Management

### View Tables
```bash
psql -d snatchbase -c "\dt"
```

### Reset Database (Warning: Deletes All Data)
```bash
cd backend
source venv/bin/activate
python reset_database.py
```

### Manual Data Ingestion
```bash
cd backend
source venv/bin/activate
python manual_ingest.py
```

Place ZIP or RAR files in `backend/data/incoming/uploads/` before running.

---

## API Endpoints

### Statistics
```bash
curl http://localhost:8000/api/stats
curl http://localhost:8000/api/stats/browsers?limit=20
curl http://localhost:8000/api/stats/credit-cards
```

### Search
```bash
curl "http://localhost:8000/api/search/credentials?q=gmail&limit=50"
```

### Devices
```bash
curl http://localhost:8000/api/devices?limit=20
curl http://localhost:8000/api/devices/1
```

---

## Troubleshooting

### Backend Not Responding
```bash
# Check if process is running
ps aux | grep "python -m launcher"

# Restart service
cd backend
source venv/bin/activate
python -m launcher.api_service
```

### Frontend Build Errors
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
Check database configuration in `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost/snatchbase
```

Verify PostgreSQL is running:
```bash
systemctl status postgresql
```

---

## Configuration Files

### Archive Passwords
Edit `backend/passwords.txt` to add passwords for encrypted archives:
```
# One password per line
# Lines starting with # are comments
password1
password2
https://t.me/ChannelName
```

### Environment Variables
Edit `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost/snatchbase
SECRET_KEY=your-secret-key
DEBUG=false
```

---

## Performance Optimization

### RAR Archive Processing
RAR files are automatically extracted to temporary directories for optimal performance. This avoids repeated external process calls during file-by-file extraction.

### Database Indexing
Tables are indexed on frequently queried fields. For large datasets, consider additional composite indexes based on query patterns.

### Search Performance
Use specific filters (domain, stealer_name, browser) to narrow result sets before applying general text search.

---

## Development Workflow

### Adding API Endpoints
1. Create router in `backend/app/routers/`
2. Define data models in `backend/app/models.py`
3. Implement business logic in `backend/app/services/`
4. Register router in `backend/app/main.py`
5. Update frontend API client in `frontend/src/services/api.ts`

### Adding UI Components
1. Create component in `frontend/src/components/`
2. Add page in `frontend/src/pages/`
3. Update routing in `frontend/src/App.tsx`
4. Add TypeScript interfaces in `frontend/src/services/api.ts`

---

## System Requirements

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- 4GB RAM minimum (8GB recommended for large datasets)
- 10GB disk space minimum (scales with data volume)

---

## Resources

- API Documentation: http://localhost:8000/docs
- Frontend Development: http://localhost:5173
- Database: PostgreSQL connection via DATABASE_URL
- Logs: Terminal output from respective services

---

Last Updated: 2025-11-27

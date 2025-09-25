# Snatchbase - Stealer Log Aggregator

A modern stealer log aggregation and search engine similar to HudsonRock and Flare.io, built with FastAPI and React.

## Features

- 🔍 **Advanced Search** - Search across credentials and compromised systems with powerful filters
- 📊 **Analytics Dashboard** - Real-time threat intelligence and data visualization
- 🚀 **Modern UI** - Beautiful, responsive interface with smooth animations
- 🔒 **Multi-format Support** - Process ZIP, RAR, and 7Z stealer log archives
- 📈 **Data Visualization** - Interactive charts and geographic distribution maps
- 🛡️ **Threat Intelligence** - Risk assessment and stealer family classification

## Architecture

### Backend (FastAPI)
- **Parser Integration** - Uses the existing stealer-parser library
- **Database Models** - SQLAlchemy models for credentials and systems
- **REST API** - Comprehensive endpoints for search, upload, and analytics
- **Background Processing** - Async file processing with progress tracking

### Frontend (React + TypeScript)
- **Modern Stack** - Vite, React 18, TypeScript, Tailwind CSS
- **Animations** - Framer Motion for smooth interactions
- **Data Visualization** - Recharts for analytics and charts
- **State Management** - React Query for server state

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Poetry (for Python dependencies)

### Backend Setup

1. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the API server**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Usage

### 1. Upload Stealer Logs
- Navigate to the Upload page
- Drag and drop your stealer log archives (.zip, .rar, .7z)
- Enter password if the archive is protected
- Monitor processing progress

### 2. Search Intelligence
- Use the Search page to find specific credentials or systems
- Apply filters for domain, username, software, country, etc.
- Toggle password visibility for credentials
- Export results for further analysis

### 3. Analytics Dashboard
- View overall statistics and trends
- Analyze geographic distribution of threats
- Monitor stealer family activity
- Track threat intelligence feeds

## Data Models

### Credentials
- Software (browser/application)
- Host/Domain
- Username/Email
- Password
- File path
- Stealer family

### Systems
- Machine ID
- Computer name
- Hardware ID
- User account
- IP address
- Country
- Compromise date

## API Endpoints

### Core Endpoints
- `POST /upload` - Upload stealer log archive
- `GET /search/credentials` - Search credentials with filters
- `GET /search/systems` - Search systems with filters
- `GET /stats` - Get database statistics
- `GET /stats/domains` - Top domains by credential count
- `GET /stats/countries` - Country distribution
- `GET /stats/stealers` - Stealer family statistics

### Example API Usage

```python
import requests

# Upload a file
with open('stealer_logs.zip', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/upload',
        files={'file': f},
        data={'password': 'optional_password'}
    )

# Search credentials
response = requests.get(
    'http://localhost:8000/search/credentials',
    params={
        'q': 'gmail.com',
        'limit': 50,
        'offset': 0
    }
)
```

## Development

### Project Structure
```
snatchbase/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # Database configuration
│   │   └── services/       # Business logic
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.tsx
│   └── package.json
├── stealer-parser/         # Existing parser library
└── data/                   # Sample data
```

### Adding New Features

1. **Backend**: Add new endpoints in `app/main.py` and business logic in `app/services/`
2. **Frontend**: Create components in `src/components/` and pages in `src/pages/`
3. **Database**: Add new models in `app/models.py` and corresponding schemas

## Testing with Sample Data

The project includes sample stealer log data in the `data/` folder:
- `valencigalogs.zip` (110MB) - Sample stealer log archive

To test:
1. Start both backend and frontend servers
2. Navigate to the Upload page
3. Upload the sample file
4. Explore the parsed data in Search and Analytics

## Security Considerations

- **Data Sensitivity**: Stealer logs contain sensitive information
- **Access Control**: Implement authentication in production
- **Data Encryption**: Encrypt sensitive data at rest
- **Network Security**: Use HTTPS in production
- **Input Validation**: All uploads are validated and sandboxed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and research purposes. Handle stealer log data responsibly and in accordance with applicable laws and regulations.

## Acknowledgments

- **stealer-parser** - Core parsing functionality by Lexfo
- **FastAPI** - Modern Python web framework
- **React** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

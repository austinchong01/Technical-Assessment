# Face Detection Technical Assessment

A full-stack application for implementing face detection on video content, designed as a technical assessment platform.

## Project Structure

This repository contains two main components:

### Backend (`/backend`)
- **Technology**: Python Flask/FastAPI
- **Purpose**: Provides API endpoints for face detection processing
- **Key Files**:
  - `main.py` - Main application entry point
  - `helpers.py` - Utility functions and helpers
  - `requirements.txt` - Python dependencies

### Frontend (`/frontend`)
- **Technology**: React with TypeScript
- **Purpose**: User interface for video playback and face detection visualization
- **Key Files**:
  - `src/App.tsx` - Main React component
  - `src/components/` - Reusable UI components
  - `src/consts.ts` - Configuration constants (video URL)

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the project root directory
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python backend/main.py
   ```

The backend will run on `http://127.0.0.1:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Backend Routes
- `GET /hello-world` - Test endpoint to verify backend connectivity
- Additional endpoints can be added for face detection processing

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. The video will be displayed and ready for face detection
4. Click "Ping Backend" to test the connection between frontend and backend
5. Implement face detection logic in the backend and connect it to the frontend

## Development Notes

### For Assessment Takers
- The main task is to implement face detection functionality
- Backend: Add face detection processing endpoints in `app/main.py`
- Frontend: Connect to your backend endpoints from `src/App.tsx`
- The video URL is configured in `frontend/src/consts.ts`

### Project Configuration
- Video source is configured in `frontend/src/consts.ts`
- Backend port is set to 8080 by default
- Frontend development server runs on port 3000

## Technologies Used

- **Backend**: Python, Flask/FastAPI
- **Frontend**: React, TypeScript, HTML5 Video
- **Styling**: CSS3 with modern responsive design
- **Development**: Hot reload for both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test both backend and frontend
5. Submit a pull request

## License

This project is designed for technical assessment purposes.

You may use any tool you wish but you are responsible for understanding all parts of the implementation.
# 🗺️ Tour Planner

---

## 🌟 Highlights

- Full-stack travel planning system
- Built using React + Node.js + MySQL
- Handles user authentication, itinerary, budgeting
- Modular backend architecture

A full-stack web application to plan, manage, and track personalized tours — with itinerary building, hotel and transport discovery, destination browsing, and budget tracking.

---

## 🚀 Features

- User registration and login with JWT authentication
- Role-based access — user and admin roles
- Browse and search travel destinations
- Create and manage tours end-to-end
- Day-by-day itinerary builder
- Hotel discovery by destination
- Transport options by city (airport, train stations, bus stops)
- Budget tracker per tour
- Admin dashboard for platform management
- Protected routes based on login state

---

## 🛠️ Tech Stack

### Frontend
| Technology          | Purpose |
|---------------------|---------|
| React 19 + Vite     | UI framework and build tool |
| React Router v7     | Client-side routing |
| Axios               | API calls to backend |

### Backend
| Technology          | Purpose |
|---------------------|---------|
| Node.js + Express 5 | REST API server |
| MySQL2              | Relational database |
| JWT (jsonwebtoken)  | Authentication tokens |
| bcryptjs            | Password hashing |
| dotenv              | Environment configuration |

### Testing
| Technology       | Purpose |
|------------------|---------|
| Jest + Supertest | Unit and API tests |
| Blackbox tests   | Endpoint-level API tests |
| Whitebox tests   | Controller and logic unit tests |
| Istanbul         | Code coverage reports |

---

## 📁 Project Structure

```
tour-planner/
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Route logic (auth, tour, hotel, transport, budget, itinerary, destination)
│   ├── middleware/         # JWT auth middleware
│   ├── routes/             # API route definitions
│   ├── services/           # Hotel and transport data services
│   ├── __tests__/          # Blackbox and whitebox test suites
│   └── server.js           # Express app entry point
│
└── frontend/
    └── src/
        ├── components/     # Navbar, ProtectedRoute
        ├── pages/          # All page components
        ├── services/       # Axios API layer
        └── App.jsx         # Root component and routing
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18 or above
- MySQL 8 or above

### 1. Clone the repository

```bash
git clone https://github.com/Nikitha Thuppathi/tour-planner.git
cd tour-planner
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=tour_planner
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev      # development with auto-restart
npm start        # production
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

App will run at `http://localhost:5173`

---

## 🔌 API Endpoints
 
| Method    | Endpoint                      | Description               | Auth Required |
|-----------|-------------------------------|---------------------------|
| POST      | `/api/auth/register`          | Register a new user       | No  |
| POST      | `/api/auth/login`             | Login and get token       | No  |
| GET       | `/api/destinations`           | Get all destinations      | Yes |
| GET       | `/api/destinations/:id`       | Get destination by ID     | Yes |
| GET/POST  | `/api/tours`                  | Get or create tours       | Yes |
| GET/POST  | `/api/itinerary`              | Get or create itinerary   | Yes |
| GET       | `/api/hotels`                 | Get all hotels            | Yes |
| GET       | `/api/hotels/destination/:id` | Get hotels by destination | Yes |
| GET       | `/api/transport`              | Get all transport options | Yes |
| GET/POST  | `/api/budget`                 | View or update budget     | Yes |

> All protected routes require `Authorization: Bearer <token>` in the request header.

---

## 🧪 Running Tests

```bash
cd backend

npm test                    # Run all tests
npm run test:blackbox       # API-level blackbox tests only
npm run test:whitebox       # Unit tests only
npm run test:coverage       # Generate coverage report
```

Coverage report is generated at `backend/coverage/lcov-report/index.html`

---

## 📝 Notes

- Hotel and transport data is generated deterministically by city name on the backend — the same city always returns the same results. This approach was chosen to keep the app fully functional without depending on external paid APIs, and is designed to be swappable with a live API in production.
- Destination data is stored and managed in the MySQL database.

---

## 👤 Author

Built by [Nikitha Thuppathi] — [thuppathinikitha07@gmail.com]

---

## 📄 License

MIT

<img width="1578" height="864" alt="image" src="https://github.com/user-attachments/assets/69634695-1761-489d-9bfa-4c0938cde70f" />
<img width="1381" height="900" alt="image" src="https://github.com/user-attachments/assets/2a33079d-4be5-48bd-a3f1-60c30cbd9e0a" />
<img width="1072" height="847" alt="image" src="https://github.com/user-attachments/assets/671dcff4-e717-4f4e-8a38-5079a0f73294" />
<img width="1074" height="718" alt="image" src="https://github.com/user-attachments/assets/62533b73-1078-47af-a5c1-991d79d097b9" />
<img width="1095" height="910" alt="image" src="https://github.com/user-attachments/assets/43c6ee51-03e2-437d-ae32-da5da53c7914" />
<img width="1057" height="903" alt="image" src="https://github.com/user-attachments/assets/f7efefe5-1093-4d57-93f6-445ab83f3eb0" />
<img width="1075" height="894" alt="image" src="https://github.com/user-attachments/assets/e35660b9-a553-4dfc-9159-bcd7552973a0" />




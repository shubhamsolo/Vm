# 🚢 FuelEU Maritime Compliance Platform

#live line[https://vm-rpql.vercel.app/]

A full-stack compliance management system for maritime vessels, built with modern web technologies and clean architecture principles.

**Frontend:** React + TypeScript + Tailwind CSS + Recharts  
**Backend:** Node.js + Express + PostgreSQL + Prisma  
**Architecture:** Hexagonal (Ports & Adapters) Pattern

---

## ✨ Core Features

### 📊 Routes Tab
View all vessel routes and set baselines for compliance comparison. Select any route to establish it as the baseline reference point.

### 📈 Compare Tab
Interactive data visualization dashboard featuring:
- **Bar Chart:** GHG intensity comparison against baseline and 2025 target (89.3368 gCO₂e/MJ)
- **Compliance Table:** Percentage difference calculations and compliance status indicators

### 🏦 Banking Tab (Article 20)
Manage ship compliance balances with stateful operations:
- **Calculate CB:** Formula: CB = (Target - Actual) × Energy
- **Bank Surplus:** Store excess compliance credits
- **Apply Bank:** Use banked funds to cover deficits (FIFO)

### ⚡ Pooling Tab (Article 21)
Create multi-ship compliance pools with:
- Adjusted CB calculations for each vessel
- Validation: Sum(AdjustedCB) ≥ 0 and minimum 2 members
- Greedy allocation algorithm for surplus-to-deficit transfers
- Atomic database transactions for data integrity

---

## 🏛️ Architecture: Hexagonal Pattern

Clean separation of concerns with three layers:

| Layer | Purpose | Backend | Frontend |
|-------|---------|---------|----------|
| **Core** | Pure business logic | `/core/application`, `/core/domain` | `/core/application`, `/core/domain` |
| **Ports** | Interface contracts | `/core/ports` | `/core/ports` |
| **Adapters** | Framework implementations | `/adapters/inbound/http`, `/adapters/outbound/postgres` | `/adapters/ui`, `/adapters/infrastructure` |

This design enables **100% testable core logic** without web servers or databases.

---

## 💻 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Recharts, Axios |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Testing** | Jest, Supertest, React Testing Library |

---

## 🚀 Quick Start

### Backend Setup (Terminal 1)

```bash
cd backend
npm install

# Create .env with your PostgreSQL connection
echo 'DATABASE_URL="postgresql://user:password@host:port/database"' > .env

# Setup database
npx prisma migrate dev --name init
npx prisma db seed

# Start server
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

---

## 🧪 Testing

```bash
# Backend tests (unit + integration)
cd backend && npm run test

# Frontend tests
cd frontend && npm run test
```

---

## 📖 API Reference

### Routes
- `GET /api/routes` - Fetch all routes
- `POST /api/routes/:id/baseline` - Set baseline route
- `GET /api/routes/comparison` - Get comparison data

### Compliance
- `GET /api/compliance/cb?shipId=X&year=Y` - Calculate compliance balance
- `GET /api/compliance/adjusted-cb?shipId=X&year=Y` - Get adjusted balance

### Banking
- `POST /api/banking/bank` - Bank surplus
- `POST /api/banking/apply` - Apply banked funds
- `GET /api/banking/records?shipId=X` - View bank records

### Pooling
- `POST /api/pools` - Create pool (atomic transaction)

---

## 📚 Documentation

- **AGENT_WORKFLOW.md** - AI collaboration logs and development process
- **REFLECTION.md** - Architecture insights and efficiency analysis


---

# 🔥 README — FRONTEND  
📁 `frontend-employee-document-portal/README.md`

# Employee Document Portal — Frontend

Frontend application for Employee Document Portal built with **React + Vite**.

---

## 🚀 Tech Stack

- React
- Vite
- Axios
- React Router DOM
- Tailwind CSS

---

## 📦 Features

- Login authentication
- Protected routes
- Role-based UI rendering
- Dashboard:
  - Recent uploads (Top 5)
  - Top downloads (Top 5)
- Documents list:
  - Search (title + description)
  - Filter by category
  - Filter by department
  - Sorting options
  - Pagination
- Upload document
- Document details page
- Edit metadata
- Delete with confirmation dialog
- Success & error alerts
- Loading states & empty states

---

## ⚙️ Installation

### 1. Open frontend folder

```bash
cd frontend-employee-document-portal

2. Install dependencies
    npm install

3. Environment Setup - create .env file
    VITE_API_URL=http://localhost:8000

4. Run development server
    npm run dev

    Frontend URL -> http://localhost:5173

5. Authentication Flow

    - User login
    - Backend returns token
    - Token stored in localStorage
    - Axios interceptor auto attaches token

👥 Demo Accounts
Role	| Email	    | Password
Admin	admin@example.com | password
Manager	manager@example.com | password
Employee	employee@example.com | password

6. Pages
    /login
    /dashboard
    /documents
    /documents/:id
    /documents/upload
    /documents/:id/edit

7. UI Requirements Covered

    - Success messages (green)
    - Error messages (red)
    - Confirmation dialog (delete)
    - Empty states
    - Form validation display
    - Loading spinner
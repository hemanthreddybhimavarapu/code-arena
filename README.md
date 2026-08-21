# CodeArena 7.0
> An Elite Full Stack Coding Platform for Practice and Performance Assessment.
> **Practice. Compile. Compete. Conquer.**

CodeArena is a state-of-the-art coding platform similar to LeetCode, HackerRank, and VS Code combined. It contains a sandboxed compilation/execution engine using Docker, gamified user dashboards, global leaderboard standings, bookmarking systems, discussion boards, and an interactive admin panel.

---

## Technical Stack

### Backend
- **Core**: Java 21, Spring Boot 3.x
- **Security**: Spring Security 6, JWT Authentication, BCrypt
- **Database**: PostgreSQL (No H2), JPA (Hibernate)
- **Migrations**: Flyway Migration
- **Testing**: JUnit 5, Mockito
- **Execution Sandbox**: Docker Containers, ProcessBuilder

### Frontend
- **Framework**: React 18, Vite, React Router, Axios
- **Editor**: Monaco Editor
- **Styling**: Tailwind CSS (Dark/Light Modes)
- **Animations**: Framer Motion
- **Visuals**: Recharts (Pie & Bar charts), Lucide Icons, Canvas Confetti

---

## Features

1. **Sandboxed Code Execution Engine**: Runs Java, Python, C, C++, and Node.js solutions in isolated container sessions limit to 512MB RAM and 5s timeouts.
2. **GitHub Contribution Grid**: A visual dashboard heatmap showing daily solution submissions.
3. **Interactive Monaco Editor**: Auto-complete, font size toggles, fullscreen coding workspace, download, and reset capabilities.
4. **Leaderboard Podium**: A visually stunning animated podium presenting Top 3 rankings.
5. **Forum / Discussions**: Comment on coding questions, offer code improvements, or reply to community queries.
6. **Robust Admin Console**: Analytics distribution, CRUD problems, seed test cases, remove users, and manage tags/hints/editorials.

---

## Quick Start Setup

### Step 1: Clone & Infrastructure Config
Launch the PostgreSQL Database and local SMTP Mailhog Server using docker-compose:
```bash
docker compose up -d
```
*Check mail server logs or view outgoing registration OTP emails at [http://localhost:8025](http://localhost:8025).*

### Step 2: Boot up the Spring Boot Backend
1. Ensure Java 21 JDK is installed.
2. Run the application:
```bash
cd backend
mvn spring-boot:run
```
*Flyway migrations will automatically run, create database tables, and seed starter problems like "Two Sum" and "Palindrome Number" with their respective test cases, hints, and editorials.*

### Step 3: Launch the React Frontend
1. Install dependencies:
```bash
cd frontend
npm install
```
2. Start the Vite server:
```bash
npm run dev
```
*Navigate to [http://localhost:5173](http://localhost:5173) in your browser.*

---

## Default User Accounts
- **Admin User**: `admin` / `password123`
- **Standard User**: `user` / `password123`
- *New users can register, receive a verification OTP code via Mailhog SMTP (viewable on UI port 8025), and authenticate immediately.*

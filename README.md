# Authentication-Api
# Full Stack App Setup (React + Node.js + MSSQL)

## 📦 Requirements

- Node.js installed
- Local MSSQL Server running


##  Backend Setup

```bash
git clone https://github.com/Griva100/Authentication-Api.git
cd Authentication-Api/backend
npm install
```
Create .env file in backend folder:
```bash
PORT=5000
DB_USER=your_sql_username
DB_PASS=your_sql_password
DB_SERVER=localhost
DB_NAME=your_database_name
```
Replace values with your actual MSSQL credentials.

Start Backend
```bash
node server.js
```
## Frontend Setup

```bash
cd Authentication-Api/frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

Backend runs on http://localhost:5000






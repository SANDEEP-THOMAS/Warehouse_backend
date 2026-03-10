 Warehouse Workforce System (Backend)
 ----------------------------------

1️⃣ Project Overview
--------------------

This system is a simplified Warehouse Workforce Management backend built using:

Node.js

Express.js

MongoDB

JWT Authentication

It supports role-based access for:

Admin

Supervisor

Operator

2️⃣ Tech Stack
--------------

Node.js

Express.js

MongoDB (Mongoose)

JWT

bcryptjs


3️⃣ Setup Instructions
----------------------

Install Dependencies
npm install

Create .env File
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

Start Server
npm run dev


Server runs at:
http://localhost:5000


4️⃣ Database Choice Justification
----------------------------------

MongoDB was selected because:

Flexible schema design

Easy relationship handling using ObjectId references

Suitable for modular scalable systems

Fast aggregation support for dashboard statistics

Relationships implemented:

User → Operator (Linked via operatorId)

Task → Operator (assignedOperator reference)

Unique Constraints:

username (User)

employeeCode (Operator)

5️⃣ Database Schema
--------------------

User Collection

name

username (unique)

password (hashed)

role (ADMIN / SUPERVISOR / OPERATOR)

operatorId (if role = OPERATOR)

isActive

Operator Collection

name

employeeCode (unique)

role (Picker / Packer / Supervisor)

shift

status (ACTIVE / INACTIVE)

Task Collection

title

description

taskType

priority (LOW / MEDIUM / HIGH)

assignedOperator (ObjectId reference)

status (PENDING / IN_PROGRESS / COMPLETED)

completedDate

timestamps

6️⃣ API Endpoints
-----------------

Authentication

POST /api/auth/login

User Management (Admin)

POST /api/users

GET /api/users

PUT /api/users/:id

PATCH /api/users/:id/deactivate

Operator Management

POST /api/operators

GET /api/operators

PUT /api/operators/:id

PATCH /api/operators/:id

GET /api/operators/search

Task Management

POST /api/tasks

GET /api/tasks

PATCH /api/tasks/:id

Dashboard

GET /api/dashboard

(All protected via JWT)

7️⃣ Architecture
-----------------

The system follows a modular MVC pattern:

models → database schemas

controllers → business logic

routes → API routing

middlewares → authentication & role authorization

config → environment setup

Role-Based Access Control (RBAC) implemented using middleware.

JWT used for stateless authentication.
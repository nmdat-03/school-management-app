🎓 School Management System

A full-stack school management web application that helps administrators and teachers manage students, classes, and academic information efficiently.

✨ Features

👨‍💼 Admin
Manage students (add, edit, delete)
Manage teachers
Create and manage classes
Assign students to classes

👩‍🏫 Teacher
View assigned classes
Manage student scores
Track student performance

👨‍🎓 Student (optional)
View personal information
View scores and class schedule

🛠️ Tech Stack
Frontend: Next.js, React, TypeScript
Styling: TailwindCSS, shadcn/ui
State Management: Zustand
Backend: Next.js API Routes / Express (tuỳ bạn)
Database: Prisma + PostgreSQL / MySQL
Authentication: Clerk / JWT

⚙️ Installation
git clone https://github.com/your-username/school-management.git
cd school-management
npm install
npm run dev

🔑 Environment Variables

Create a .env file in the root directory:

DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 
NEXT_PUBLIC_CLOUDINARY_API_KEY =

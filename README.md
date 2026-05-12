# 🎓 School Management System

A full-stack school management web application that helps administrators and teachers manage students, classes, and academic information efficiently.

Demo pictures: https://docs.google.com/document/d/1CBwxz9oHTqodeyoSjkrwvIxsyxWKTS-O_YGphclhRVU/edit?usp=drive_link

## ✨ Features

### 👨‍💼 Admin
+ Manage students (add, edit, delete)
+ Manage teachers
+ Create and manage classes
+ Assign students to classes

### 👩‍🏫 Teacher
+ View assigned classes
+ Manage student scores
+ Track student performance

### 👨‍🎓 Student
+ View personal information
+ View scores and class schedule

## 🛠️ Tech Stack

+ Frontend: Next.js, React, TypeScript
+ Styling: TailwindCSS
+ State Management: React Hook Form / Zod
+ Database: Prisma ORM + PostgreSQL
+ Authentication: Clerk
+ Image Upload: Cloudinary

## ⚙️ Installation
```bash
git clone https://github.com/nmdat-03/school-management-app.git
cd school-management
pnpm install
pnpm dev
```

## 🔑 Environment Variables

### Create a .env file in the root directory:
```env
# App Url
DATABASE_URL=""

# Clerk Authentication
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME = 
CLOUDINARY_API_KEY =
```

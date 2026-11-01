# Local Development Guide

This guide explains how to set up and run **TaskFlow** on your local machine.

Follow the steps below to get your own local instance running.

## 1. Prerequisites

Before getting started, make sure you have:

- [Node.js](https://nodejs.org/) installed.
- npm (included with Node.js).
- [Git](https://git-scm.com/) installed.

To verify your installation, open a terminal and run:

```bash
node -v
npm -v
git --version
```

## 2. Clone the Repository

```bash
git clone https://github.com/atharvgawade7/TaskFlow.git
cd TaskFlow
```

## 3. Install Dependencies

```bash
npm install
```

This installs the dependencies listed in `package.json`.

## 4. Configure Environment Variables

TaskFlow uses **Supabase** for user authentication and cloud database storage.

### Get your credentials

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Navigate to **Project Settings → API**.
4. Copy your **Project URL** and **Publishable Key**.

### Create the environment file

Create a file named `.env.local` in the root directory of the project.

Add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholders with your own project credentials.

### Database Configuration

**Make sure your Supabase project has the required database tables, columns, and security policies structured according to TaskFlow's application requirements.

The database structure should support the application's core features, including user routines, daily task tracking, one-time tasks, and meal tracking.**

**Security notes:**

- Use the Supabase Publishable Key for frontend configuration.
- Never expose your Supabase Secret Key or Service Role Key in frontend code.

## 5. Understanding Local Development and Data Storage

Running TaskFlow locally means the application runs on your own machine through the Vite development server. However, its current version uses Supabase for authentication and data storage.

This means:

- The frontend runs locally in your browser.
- User accounts and application data are stored in your connected Supabase project.
- Data remains available across sessions and devices when you log in to the same account.

**Note:** An earlier TaskFlow prototype used browser `localStorage` for data persistence. The related helper code is still present in the repository, but the current application uses Supabase as its active data storage system.

## 6. Start the Development Server

```bash
npm run dev
```

Vite will start the local development server.

Open the URL displayed in your terminal. By default:

```text
http://localhost:5173
```

You should now be able to access TaskFlow in your browser.

## 7. Build for Production

Generate an optimized production build:

```bash
npm run build
```

The generated files will be available in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## Troubleshooting

**Environment variables not loading**

- Check that `.env.local` is in the project root.
- Verify the variable names and values.
- Restart the development server after changing environment variables.

**Supabase connection errors**

- Verify your Project URL and Publishable Key.
- Make sure your Supabase project is active.
- Check your browser console for connection errors.

**Dependencies or package errors**

```bash
npm install
```

---

**You're ready to explore TaskFlow locally!**

For project details, features, architecture and technology information, see the main [README](../README.md).

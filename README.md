# TaskFlow — Plan. Track. Grow.

A personal productivity and routine management application designed to bring daily habits, recurring routines, one-time tasks, and meal tracking together in one place.

TaskFlow follows a simple idea:

**Configure once. Show up daily. Track your progress.**

Instead of repeatedly planning the same activities, configure your routines once and let TaskFlow organize them around your weekly schedule.

---

## ✨ Overview

Managing college work, personal routines, fitness, and everyday responsibilities across different apps can become unnecessarily complicated.

TaskFlow brings these activities into a single dashboard where you can plan your day, track completion, manage deadlines, and understand your consistency over time.

It is built around two important concepts:

- **Recurring activities:** Configure routines once and have them appear according to their assigned weekdays.
- **Historical tracking:** Record daily progress independently so that changes to future routines don't rewrite your past activity records.

---

## 🚀 Features

### 1. Dashboard & Daily Overview

- Centralized productivity dashboard.
- Daily completion percentage and progress indicator.
- Quick access to routines and tasks.
- Weekly activity overview.
- Summary of scheduled, completed, and pending activities.

### 2. Recurring Routine Manager

- Create and manage recurring routines.
- Configure specific weekdays or daily schedules.
- Organize routines into Morning, Afternoon, Evening, and Night.
- Track daily status: Completed, Pending, Missed, or Skipped.
- Edit or archive routines.
- Preserve historical daily activity records when routine definitions change.

### 3. Weekly Schedule

- Seven-day schedule overview.
- View routines assigned to individual weekdays.
- Separate daily activities from selected-day activities.
- Timeline-based schedule visualization.

### 4. One-Time Task Manager

- Manage college assignments, deadlines, and personal tasks.
- Add descriptions, due dates, and due times.
- Organize tasks using categories and priorities.
- Filter tasks by status and category.
- Edit, complete, and delete tasks.

### 5. Daily Meal Tracker

- Create customizable meal checkpoints.
- Organize meals by time and category.
- Add meal descriptions and estimated calories.
- Track meals as Eaten, Pending, or Skipped.
- Monitor daily meal completion.

### 6. Insights & Activity Tracking

- Historical completion statistics.
- Weekly productivity trends.
- Category-wise activity breakdown.
- GitHub-style activity heatmap.
- Visual representation of daily consistency.

### 7. Authentication & Personal Data

- User registration and login.
- Session management through Supabase Auth.
- Cloud-based data storage.
- User-specific database access using Row Level Security (RLS).

---

## 🛠️ Tech Stack

| Technology    | Purpose                                 |
| ------------- | --------------------------------------- |
| React 19      | Frontend UI and component architecture  |
| Vite 8        | Development server and build tooling    |
| JavaScript    | Application logic                       |
| CSS           | Styling and responsive UI               |
| Supabase      | Backend infrastructure                  |
| Supabase Auth | User authentication                     |
| PostgreSQL    | Database                                |
| Git & GitHub  | Version control and source code hosting |

---

## 🏗️ Application Architecture

TaskFlow uses React for the frontend and Supabase as its backend.

**High-level data flow:**

```text
              USER
                |
                v
        React Application
                |
        +-------+-------+
        |               |
        v               v
   Supabase Auth    Dashboard UI
        |               |
        |               v
        |         Application Logic
        |               |
        +-------+-------+
                |
                v
          Supabase Client
                |
                v
          PostgreSQL DB
                |
                v
        Row Level Security
```

### Database Structure

The application currently uses four main database tables:

| Table            | Responsibility                                |
| ---------------- | --------------------------------------------- |
| `routines`       | Stores recurring routine definitions          |
| `daily_tasks`    | Stores date-specific routine activity records |
| `one_time_tasks` | Stores individual tasks and deadlines         |
| `meals`          | Stores meal checkpoints and completion status |

Row Level Security ensures that authenticated users can access records belonging to their own accounts.

---

## 📂 Project Structure

```text
TaskFlow/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ActivityHeatmap.jsx
│   │   ├── AuthPage.jsx
│   │   ├── Header.jsx
│   │   ├── OverviewView.jsx
│   │   ├── RoutineView.jsx
│   │   ├── ScheduleView.jsx
│   │   ├── TasksView.jsx
│   │   ├── MealTrackerView.jsx
│   │   ├── InsightsView.jsx
│   │   └── ...
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── data/
│   │   ├── sampleData.js
│   │   └── taskStore.js
│   │
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   └── supabaseData.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── package.json
└── vite.config.js
```

---

## 🔐 Security

TaskFlow uses Supabase authentication and PostgreSQL Row Level Security.

- Authenticated users have their own data.
- Database operations are scoped to the signed-in user.
- RLS policies restrict access using the authenticated user's ID.
- Environment variables are used for frontend Supabase configuration.

---

## 🎯 Project Goals

TaskFlow is also a hands-on learning project focused on understanding the complete web development workflow.

Some of the key areas explored while building it include:

- Building a component-based application using React.
- Managing application state and reusable components.
- Integrating a frontend with a backend service.
- Implementing authentication and database operations.
- Understanding database relationships and access policies.
- Using Git and GitHub for version control.
- Learning the process of deploying a web application.

---

## 🔮 Future Scope

Some areas that could be explored in future iterations:

- Live deployment and production configuration.
- Improved analytics and productivity insights.
- Additional personalization options.
- Further improvements to the user experience.

---

## 👨‍💻 Author

**Atharv Gawade**

First-Year Computer Engineering Student |&#x20;

[GitHub](https://github.com/atharvgawade7)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Built as a learning journey — one feature, one concept, and one commit at a time.*


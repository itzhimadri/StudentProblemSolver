# StudyFlow — Student Assignment Dashboard

A beginner-friendly student assignment dashboard inspired by the supplied reference image. Built with HTML, CSS, and vanilla JavaScript. It runs locally in a browser and saves tasks with `localStorage`.

## Features
- Dashboard cards: total, due today, upcoming, completed
- Add, edit, delete, complete and reopen assignments
- Subject and status filters
- Search by assignment, subject, or notes
- Calendar navigation and clickable dates
- Upcoming reminders
- Responsive layout for desktop and mobile
- Local persistence in the browser (no database setup required)
- Sample assignments to demonstrate the dashboard immediately

## Run in VS Code
1. Extract the ZIP file.
2. Open the `student_assignment_dashboard` folder in VS Code.
3. Open `index.html`.
4. Recommended: install the **Live Server** extension in VS Code.
5. Right-click `index.html` → **Open with Live Server**.

You can also open `index.html` directly in a browser. No Python packages or npm commands are required.

## Data storage
Assignments are stored in your browser's local storage. Data stays in that browser on that computer. Clearing browser site data may remove saved tasks.

## Notes
- The dashboard starts with sample assignments for demonstration. You can edit or delete them.
- This is a front-end local prototype, not a multi-user cloud app. A backend and database would be needed for accounts and cross-device syncing.

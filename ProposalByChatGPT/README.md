# Practice System

[Proposal Practice System](https://www.notion.so/Practice-System-2af22762e3c780d1aa23fa64028f15c3?pvs=21)
[To do note ](https://www.notion.so/Practice-System-2af22762e3c780d1aa23fa64028f15c3?pvs=21)

A web-based exam practice application designed to display reference book questions and allow users to answer and review results.

This project serves as a self-learning tool and a portfolio-friendly example of a practical front-end (and optional backend) web application.

---

## Features

### Core Features (MVP)

- Display question list
- Question detail page
- Answering interface
- Answer correctness checking
- JSON-based question data

### Optional Features

- Search and filter
- Categories and tags
- Random quiz mode
- User progress tracking (LocalStorage or backend)
- Backend API for managing questions

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend (Optional)

- Node.js
- Express

### Data Storage

- JSON (initial development)
- SQLite / MongoDB (optional upgrade)

---

## Project Structure

```
src/
 ├── data/
 │    └── questions.json
 ├── pages/
 │    ├── QuestionList.tsx
 │    ├── QuestionDetail.tsx
 ├── components/
 │    └── QuestionCard.tsx
 ├── App.tsx
 └── main.tsx

```

---

## Question Schema

```json
{
  "id": 1,
  "type": "single",
  "question": "以下哪個是 IPv4 位址？",
  "options": ["255.255.255.0", "fe80::1", "abcd", "192.168.0.1"],
  "answer": [3],
  "explanation": "IPv4 格式為四段 0–255 的十進位。"
}

```

---
# Подключение React-фронта к Django

## 1. Куда положить React-проект

Рекомендуется положить приложение в папку **`frontend/`** в корне репозитория:

```
Habits/
├── backend/
├── habits/
├── users/
├── frontend/          ← сюда твой React (create-react-app / Vite / и т.д.)
├── manage.py
├── requirements.txt
└── FRONTEND.md
```

Если React уже лежит в другой папке — ничего не переименовывай, просто в настройках (см. ниже) укажи свой URL (например `http://localhost:5173` для Vite).

---

## 2. Что уже настроено в Django

- **CORS**: разрешены запросы с `http://localhost:3000` и `http://127.0.0.1:3000`.  
  Если React у тебя на другом порту (например 5173), добавь в `backend/settings.py` в `CORS_ALLOWED_ORIGINS`:
  ```python
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ```
- **API привычек** (JSON):
  - **GET** `http://localhost:8000/habits/api/habits/` — список привычек текущего пользователя.
  - **POST** `http://localhost:8000/habits/api/habits/` — создание привычки.

---

## 3. Как запускать в разработке

В двух терминалах:

**Терминал 1 — бэкенд:**

```bash
cd /Users/kirer/Desktop/Habits
source venv/bin/activate
python manage.py runserver
```

Сервер: **http://127.0.0.1:8000**

**Терминал 2 — фронт:**

```bash
cd /Users/kirer/Desktop/Habits/frontend   # или путь к твоему React-проекту
npm install
npm start
```

Фронт: **http://localhost:3000** (или тот порт, что покажет скрипт).

В React запросы делай на бэкенд: **`http://127.0.0.1:8000`** (или `http://localhost:8000`).

---

## 4. Пример запросов из React

**Список привычек (GET):**

```js
const response = await fetch('http://127.0.0.1:8000/habits/api/habits/', {
  credentials: 'include',  // если используешь сессии/куки Django
});
const data = await response.json();
// data.habits — массив { id, name, description, category, category_display, created_at }
```

**Создать привычку (POST):**

```js
const response = await fetch('http://127.0.0.1:8000/habits/api/habits/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Бег по утрам',
    description: '20 минут',
    category: 'sport',  // sport | health | study
  }),
});
const habit = await response.json();
```

Если пользователь не залогинен, API вернёт **401** и `{ "error": "Authentication required" }`. Значит, в Django нужно сначала реализовать вход (логин/сессии или JWT) и вызывать API после авторизации.

---

## 5. Другой порт у React

Если фронт крутится не на 3000 (например Vite даёт 5173), добавь в `backend/settings.py` в список `CORS_ALLOWED_ORIGINS`:

```python
'http://localhost:5173',
'http://127.0.0.1:5173',
```

После этого перезапусти `runserver`.

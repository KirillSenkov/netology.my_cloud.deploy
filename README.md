# My Cloud — дипломный проект Netology (Fullstack Python)

## Веб-приложение "облачное хранилище":
- регистрация и аутентификация пользователей (сессии + CSRF cookie)
- интерфейс администратора (управление пользователями)
- файловое хранилище: загрузка/отрытие/скачивание/переименование/комментарии/share (enable/disable) ссылкой

## Стек
- Backend: Django + PostgreSQL
- Frontend: React (Vite) + Redux + React Router
- Deploy: Docker Compose + Nginx (единая точка входа)

## Архитектура деплоя (единый URL)
Приложение доступно по одному URL (`http://<SERVER_IP>/`):
- `Nginx` раздаёт собранный frontend
- `Nginx` проксирует `/api/` на `Django backend`
- `PostgreSQL` работает внутри docker-сети (не публикуется наружу)
- файлы пользователей сохраняются в docker volume

## Требования
- Ubuntu 24.04 LTS (на VPS reg.ru)
- Docker Engine + Docker Compose plugin
- Открыт порт 80 (HTTP)
- Git

## Переменные окружения
Файл: `backend/.env`

Пример (минимум):
```
env
ADMIN_PASSWORD=Admin#1
SECRET_KEY=replace-me
DJANGO_ALLOWED_HOSTS=<SERVER_IP>,localhost,127.0.0.1

POSTGRES_DB=my_cloud
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

STORAGE_ROOT=/data/storage
```

## Быстрый запуск на сервере (VPS reg.ru)
### 1. Подключиться по SSH
`ssh deploy@<SERVER_IP>`

### 2. Клонировать репозиторий
`sudo mkdir -p /opt/my_cloud`

`sudo chown -R deploy:deploy /opt/my_cloud`

`cd /opt/my_cloud`

`git clone <REPO_URL>`

`cd <REPO_DIR>`

### 3. Заполнить переменные окружения
`nano backend/.env`

### 4. Запустить приложение
`docker compose up --build -d`

### 5. Проверка работоспособности

Открыть в браузере: `http://<SERVER_IP>/`

#### Проверка API:

`curl http://127.0.0.1/api/auth/csrf/`

#### Тестовый администратор

login: `admin`

password: `Admin#1`

---

## Локальный запуск перед деплоем

Этот режим используется для проверки перед размещением на VPS.  
Функционально совпадает с серверным деплоем, но доступ осуществляется через `localhost`.

---

#### Требования

- Docker Desktop (WSL2)
- Docker Compose plugin
- Git

---

### Запуск

Из корня монорепозитория:

#### 1. Подготовить env

Создать файл:

`backend/.env`

Пример:

```env
ADMIN_PASSWORD=Admin#1
SECRET_KEY=replace-me

DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

POSTGRES_DB=my_cloud
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

STORAGE_ROOT=/data/storage
```

---

#### 2. Собрать и запустить контейнеры

`docker compose up --build`

Или в фоне:

`docker compose up --build -d`

---

#### 3. Проверка

Открыть:

- `http://localhost/`

Проверка API:

`curl http://localhost/api/auth/csrf/`

---

### 4. Остановка

`docker compose down`

## API эндпоинты

Все API доступны по префиксу `/api/`.

---

### Аутентификация

- **GET `/api/auth/csrf/`**  
  Получить CSRF-cookie.

- **POST `/api/auth/register/`**  
  Регистрация пользователя.  
  JSON:
  ```json
  {
    "username": "user1",
    "full_name": "User One",
    "email": "user@example.com",
    "password": "Secret#1"
  }
  ```

- **POST `/api/auth/login/`**  
  Вход в систему.

- **GET `/api/auth/logout/`**  
  Завершение сессии.

- **GET `/api/auth/me/`**  
  Информация о текущем пользователе.

---

### Администрирование пользователей

- **GET `/api/admin/users/`**  
  Список пользователей с метаданными хранилищ.

- **DELETE `/api/admin/users/<user_id>/?delete_files=1`**  
  Удалить пользователя.  
  Параметр `delete_files=1` — удалить файлы пользователя вместе с аккаунтом.

- **PATCH `/api/admin/users/<user_id>/level/`**  
  Изменить уровень пользователя.  
  JSON:
  ```json
  {
    "level": "user | admin | senior_admin | superuser"
  }
  ```

---

### Работа с файлами

- **POST `/api/files/upload/`**  
  Загрузка файла.  
  `multipart/form-data`:  
  - `file` — файл  
  - `comment` — опционально

- **GET `/api/files/`**  
  Список файлов текущего пользователя.

- **GET `/api/files/?user_id=<int>`**  
  Для администратора — список файлов другого пользователя.

- **DELETE `/api/files/<file_id>/`**  
  Удалить файл.

- **PATCH `/api/files/<file_id>/rename/`**  
  Переименовать файл.  
  JSON:
  ```json
  { "name": "new_name.txt" }
  ```

- **PATCH `/api/files/<file_id>/comment/`**  
  Изменить комментарий (пустая строка разрешена).  
  JSON:
  ```json
  { "comment": "new comment" }
  ```

- **GET `/api/files/<file_id>/download/`**  
  Скачать файл.  
  Query:
  - `mode=preview` — попытка открыть в браузере  
  - иначе — скачивание

- **POST `/api/files/<file_id>/share/`**  
  Создать/включить публичную ссылку.

- **POST `/api/files/<file_id>/share/disable/`**  
  Отключить публичную ссылку.

- **GET `/api/share/<uuid>`**  
  Скачать файл по публичной ссылке.
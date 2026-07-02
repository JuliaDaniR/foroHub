# ForoHub 🚀

ForoHub es una plataforma educativa tipo foro, ahora refactorizada como aplicación full stack: un **backend REST con Spring Boot** y un **frontend SPA con React + Vite**. Además de la gestión clásica de tópicos, respuestas, usuarios y cursos, incorpora autenticación JWT, migraciones con Flyway, chat global en tiempo real mediante WebSockets, gamificación por puntos y funcionalidades asistidas por IA.

---

## Estado del refactor

El proyecto dejó de ser una aplicación Spring monolítica con vistas estáticas/Thymeleaf y pasó a una arquitectura separada por responsabilidades:

- `backend/`: API REST, seguridad, persistencia, migraciones, WebSocket e integración con servicios de IA.
- `frontend/`: interfaz React independiente con Vite, navegación por vistas, temas visuales y consumo de la API.
- `docker-compose.yml`: orquesta MySQL y el backend para levantar el entorno base.
- `frontend/public/`: assets públicos de la SPA, como logo y favicon.
- `backend/src/main/resources/db/migration/`: scripts Flyway para versionar la base de datos.

---

## Estructura del proyecto

```text
forohub/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── src/
│       ├── main/java/com/aluracursos/forohub/
│       │   ├── config/        # CORS y WebSocket/STOMP
│       │   ├── controller/    # Endpoints REST y mensajería
│       │   ├── dto/           # Contratos de entrada/salida
│       │   ├── model/         # Entidades JPA
│       │   ├── repository/    # Spring Data JPA
│       │   ├── security/      # JWT y Spring Security
│       │   └── service/       # Reglas de negocio e IA
│       └── main/resources/
│           ├── application.properties
│           └── db/migration/  # Migraciones Flyway
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       └── components/        # Login, dashboard, cursos, chat, tópicos
├── docker-compose.yml
└── README.md
```

---

## Funcionalidades principales

- **Autenticación JWT**: login stateless, registro de usuarios y protección de endpoints privados con bearer token.
- **Foro educativo**: creación, listado, detalle, actualización, baja lógica y baja definitiva de tópicos y respuestas.
- **Cursos administrables**: registro, listado paginado, actualización, eliminación lógica, descripción y tags.
- **Gamificación**: usuarios con puntos y leaderboard para impulsar participación.
- **Chat global en tiempo real**: WebSocket/STOMP con endpoint `/ws`, prefijo de aplicación `/app` y broker `/topic`.
- **IA integrada**: generación de borradores de tópicos, resumen de contenido y autocompletado/clasificación de cursos usando Gemini u OpenRouter.
- **Frontend moderno**: SPA React con vistas de login, registro, dashboard, detalle de tópico, exploración de cursos, estadísticas, chat y temas visuales.
- **Persistencia versionada**: MySQL + Flyway con migraciones para usuarios, cursos, tópicos, respuestas, puntos, descripciones y tags.

---

## Tecnologías

### Backend

- Java 21 configurado en Maven
- Spring Boot 3.3.0
- Spring Web
- Spring Security
- Spring Data JPA / Hibernate
- Spring WebSocket + STOMP
- Flyway
- MySQL 8
- Java JWT (`java-jwt`)
- Springdoc OpenAPI / Swagger UI
- Lombok
- Maven

### Frontend

- React 18
- Vite 5
- JavaScript / JSX
- STOMP client (`@stomp/stompjs`)
- SockJS client
- CSS personalizado con temas dinámicos
- ESLint

### Infraestructura

- Docker
- Docker Compose
- MySQL con volumen persistente

---

## Requisitos

- Java 21 para desarrollo local del backend
- Maven Wrapper incluido en `backend/`
- Node.js y npm para el frontend
- Docker y Docker Compose para levantar MySQL y backend en contenedores
- MySQL 8 si decides ejecutar la base de datos sin Docker

---

## Configuración

El backend lee sus valores desde variables de entorno con defaults de desarrollo:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_HOST_FORO` | Host de MySQL | `localhost` |
| `DB_PORT_FORO` | Puerto de MySQL | `3306` |
| `DB_NAME_FORO` | Nombre de la base de datos | `foro-hub` |
| `DB_USER_FORO` | Usuario de MySQL | `root` |
| `DB_PASSWORD_FORO` | Password de MySQL | vacío |
| `JWT_SECRET` | Secreto para firmar JWT | clave de desarrollo |
| `OPENROUTER_API_KEY` | API key de OpenRouter | `mock-key-for-tests` |
| `GEMINI_API_KEY` | API key de Gemini | `mock-key-for-tests` |

En `docker-compose.yml`, MySQL se levanta como `forohub-db` y el backend como `forohub-backend`.

---

## Ejecución con Docker Compose

Desde la raíz del proyecto:

```bash
docker-compose up --build
```

Servicios disponibles:

- Backend/API: `http://localhost:8080`
- MySQL: `localhost:3306`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

> El compose actual levanta base de datos y backend. El frontend se ejecuta por separado en modo desarrollo.

---

## Ejecución local

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

En Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

El backend queda disponible en `http://localhost:8080`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

La SPA queda disponible normalmente en `http://localhost:5173`. Vite proxy redirige `/login`, `/topico`, `/respuesta`, `/usuario`, `/curso`, `/ai` y `/ws` hacia `http://localhost:8080`.

### 3. Build del frontend

```bash
cd frontend
npm run build
```

---

## Seguridad

Endpoints públicos:

- `POST /login`
- `POST /usuario/registrar`
- `/swagger-ui/**`
- `/v3/api-docs/**`
- `/ws/**`
- Assets estáticos básicos

El resto de endpoints requiere header:

```http
Authorization: Bearer <token>
```

---

## Endpoints REST

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/login` | Autentica usuario y devuelve token JWT |
| `GET` | `/login/redirect` | Redirección posterior al login |

### Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/usuario/registrar` | Registra un usuario nuevo |
| `GET` | `/usuario/leaderboard` | Lista ranking de usuarios por puntos |

### Tópicos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/topico` | Crea un tópico |
| `GET` | `/topico/listar` | Lista tópicos paginados |
| `GET` | `/topico/listarPorCurso` | Lista tópicos filtrados por curso |
| `GET` | `/topico/detalle/{id}` | Obtiene detalle de un tópico |
| `PUT` | `/topico/actualizar` | Actualiza un tópico |
| `DELETE` | `/topico/eliminar/{id}` | Realiza baja lógica |
| `DELETE` | `/topico/baja/{id}` | Elimina definitivamente |
| `GET` | `/topico/alta/{id}` | Reactiva un tópico |

### Respuestas

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/respuesta/registrar` | Registra una respuesta |
| `GET` | `/respuesta/listar` | Lista respuestas paginadas |
| `GET` | `/respuesta/listarPorTopico/{topicoId}` | Lista respuestas de un tópico |
| `GET` | `/respuesta/detalle/{id}` | Obtiene detalle de una respuesta |
| `GET` | `/respuesta/solucion/{id}` | Marca una respuesta como solución |
| `PUT` | `/respuesta/actualizar` | Actualiza una respuesta |
| `DELETE` | `/respuesta/eliminar/{id}` | Realiza baja lógica |
| `DELETE` | `/respuesta/baja/{id}` | Elimina definitivamente |

### Cursos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/curso/registrar` | Registra un curso |
| `GET` | `/curso/listar` | Lista cursos paginados |
| `PUT` | `/curso/actualizar` | Actualiza datos de un curso |
| `DELETE` | `/curso/eliminar/{id}` | Realiza baja lógica de un curso |

### Inteligencia Artificial

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/ai/generate-topic` | Genera borrador de título/mensaje para un tópico |
| `POST` | `/ai/summarize` | Resume contenido de un tópico |
| `POST` | `/ai/autocomplete-course` | Sugiere o clasifica curso/tags según el contenido |

---

## WebSocket / Chat

Configuración STOMP:

- Handshake: `/ws`
- Prefijo de publicación desde cliente: `/app`
- Broker de suscripción: `/topic`
- Chat global: cliente envía a `/app/chat.sendMessage`
- Broadcast del chat: servidor publica en `/topic/public-chat`

La aplicación también usa canales de notificación para eventos del foro, como nuevos tópicos y respuestas.

---

## Base de datos

Flyway gestiona el esquema con las siguientes migraciones:

- `V1__create_tables.sql`: crea `usuarios`, `cursos`, `topicos` y `respuestas`.
- `V2__add_user_points.sql`: agrega puntos a usuarios para gamificación.
- `V3__add_course_details.sql`: agrega descripción y tags a cursos.

Hibernate está configurado con `ddl-auto=validate`, por lo que la estructura esperada debe existir mediante migraciones.

---

## Interfaz frontend

Pantallas/componentes principales:

- `Login` y `Register`: autenticación y alta de usuarios.
- `Dashboard`: feed principal de tópicos.
- `CreateTopicModal`: creación asistida de tópicos.
- `TopicDetail`: detalle de tópico y respuestas.
- `ExploreCourses` / `ManageCourses`: exploración y gestión de cursos.
- `StatsDashboard`: estadísticas y gamificación.
- `GlobalChat`: chat global en tiempo real.
- `CodeBlock`: renderizado visual de bloques de código.

La UI guarda sesión, usuario, perfil y tema en `localStorage`.

---

## Documentación API

Con el backend en ejecución:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`

---

## Mejoras visibles del refactor

- Separación clara entre API y cliente web.
- Migraciones Flyway agregadas para controlar evolución del esquema.
- Nuevo módulo de IA (`AIController`, `AIService` y DTOs específicos).
- Nuevo canal WebSocket para chat/notificaciones.
- Frontend React reemplazando vistas estáticas previas.
- Docker Compose agregado para levantar infraestructura base.

---

## Autora

Desarrollado por **Julia Daniela Rodriguez**.


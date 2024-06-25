# ForoHub API

Bienvenido a la documentación de la API ForoHub, una aplicación RESTful desarrollada con Spring que proporciona funcionalidades completas para gestionar un foro educativo.

## Descripción

ForoHub es una API diseñada para facilitar la gestión de tópicos, respuestas, usuarios y cursos dentro de un entorno educativo. Utiliza Spring Security para la autenticación basada en tokens JWT y sigue las mejores prácticas de REST para la organización de sus endpoints.

## Servidores

La API se despliega localmente en:

- Base URL: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
  
## Autorización

La API requiere autorización mediante tokens JWT para acceder a ciertos endpoints. Consulta la sección de Autenticación para más detalles.

## Tecnologías Utilizadas

- **Spring Boot**: Framework para el desarrollo de aplicaciones Java.
- **Spring Security**: Manejo de la seguridad y autenticación.
- **JWT (JSON Web Tokens)**: Para la generación y validación de tokens de acceso.
- **Spring Data JPA**: Implementación de persistencia de datos utilizando Hibernate.
- **MySql**: Base de datos para el desarrollo y pruebas.
- **Swagger/OpenAPI**: Documentación de la API.
- **Maven**: Gestión de dependencias y construcción del proyecto.
- **Java 17**: Versión del lenguaje de programación utilizada.

## Endpoints

### Tópicos (`topico-controller`)

- **Actualizar un tópico**
  - `PUT /topico/actualizar`
  - Body: `DatosActualizarTopico`

- **Crear un nuevo tópico**
  - `POST /topico`
  - Body: `DatosRegistroTopico`

- **Listar todos los tópicos**
  - `GET /topico/listar`
  - Respuesta: `List<PageDatosListadoTopico>`

- **Listar tópicos por curso**
  - `GET /topico/listarPorCurso`
  - Parámetros: `cursoId`
  - Respuesta: `List<PageDatosListadoTopico>`

- **Obtener detalles de un tópico por ID**
  - `GET /topico/detalle/{id}`
  - Respuesta: `Topico`

- **Dar de alta un tópico**
  - `GET /topico/alta/{id}`

- **Eliminar un tópico (lógico)**
  - `DELETE /topico/eliminar/{id}`

- **Eliminar permanentemente un tópico**
  - `DELETE /topico/baja/{id}`

### Respuestas (`respuesta-controller`)

- **Actualizar una respuesta**
  - `PUT /respuesta/actualizar`
  - Body: `DatosActualizarRespuestas`

- **Registrar una nueva respuesta**
  - `POST /respuesta/registrar`
  - Body: `DatosRegistroRespuestas`

- **Obtener la solución de una respuesta por ID**
  - `GET /respuesta/solucion/{id}`
  - Respuesta: `Respuesta`

- **Listar todas las respuestas**
  - `GET /respuesta/listar`
  - Respuesta: `List<PageDatosRespuestaRespuestas>`

- **Listar respuestas por tópico**
  - `GET /respuesta/listarPorTopico/{topicoId}`
  - Respuesta: `List<PageDatosRespuestaRespuestas>`

- **Obtener detalles de una respuesta por ID**
  - `GET /respuesta/detalle/{id}`
  - Respuesta: `Respuesta`

- **Eliminar una respuesta (lógico)**
  - `DELETE /respuesta/eliminar/{id}`

- **Eliminar permanentemente una respuesta**
  - `DELETE /respuesta/baja/{id}`

### Usuarios (`usuario-controller`)

- **Registrar un nuevo usuario**
  - `POST /usuario/registrar`
  - Body: `DatosRegistroUsuario`

### Autenticación (`autenticacion-controller`)

- **Iniciar sesión (login)**
  - `POST /login`
  - Body: `DatosAutenticacionUsuario`
  - Respuesta: `DatosJWTtoken`

- **Redirigir después del login**
  - `GET /login/redirect`

### Cursos (`curso-controller`)

- **Registrar un nuevo curso**
  - `POST /curso/registrar`
  - Body: `DatosRegistroCurso`

## Seguridad y Autenticación

La API utiliza Spring Security para manejar la autenticación y autorización. Los endpoints protegidos requieren un token JWT válido en el header de autorización.

## Documentación Adicional

Para una documentación más detallada sobre los parámetros, cuerpos de las peticiones y respuestas de cada endpoint, se puede explorar la documentación Swagger de la API accediendo a `/v3/api-docs`.

## Desarrollado

Este proyecto fue desarrollado por Julia Daniela Rodriguez 

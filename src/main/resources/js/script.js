// script.js

var tokenJWT = localStorage.getItem('tokenJWT');

// Función para agregar el token JWT en el encabezado de todas las solicitudes AJAX
function addJWTHeader(xhr) {
    var tokenJWT = localStorage.getItem('tokenJWT');
    if (tokenJWT) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + tokenJWT);
    }
}

// Interceptor para agregar el token JWT en todas las solicitudes
$(document).ready(function () {
    $.ajaxSetup({
        beforeSend: function (xhr) {
            addJWTHeader(xhr);
        }
    });
});

// Función para toggle del menú de navegación
function toggleMenu() {
    var navbarLinks = document.getElementById("navbarLinks");
    navbarLinks.classList.toggle("active");
    if (window.innerWidth > 768) {
        navbarLinks.classList.remove("active");
    }
}

// Función para mostrar/ocultar subcategorías
function mostrarSubcategorias(button) {
    var categoria = button.value;
    var subcategorias = document.getElementById('subcategorias-' + categoria);
    subcategorias.style.display = subcategorias.style.display === 'none' ? 'block' : 'none';
}

// Función para actualizar el navbar con el nombre de usuario autenticado
function actualizarNavbar(data) {
    var navbarLinks = document.getElementById('navbarLinks');
    var nombreUsuario = document.createElement('span');
    nombreUsuario.textContent = 'Bienvenido, ' + data.username;
    nombreUsuario.className = 'usuario-autenticado';
    navbarLinks.innerHTML = ''; // Limpiar contenido existente
    navbarLinks.appendChild(nombreUsuario);

    var logoutLink = document.createElement('a');
    logoutLink.href = '/logout';
    logoutLink.textContent = 'Logout';
    navbarLinks.appendChild(logoutLink);
}

// Función para manejar el login del usuario
function loginUsuario(correoElectronico, password) {
    var datosUsuario = {
        correoElectronico: correoElectronico,
        password: password
    };

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la autenticación');
                }
                return response.json();
            })
            .then(data => {
                // Guardar el token JWT y el nombre del usuario en localStorage
                localStorage.setItem('tokenJWT', data.jwtToken);
                localStorage.setItem('nombreUsuario', data.nombreUsuario);

                // Actualizar el navbar con el nombre del usuario autenticado
                actualizarNavbar(data);

                // Redirigir al index
                window.location.href = '/'; // redirige al index o a donde sea necesario
            })
            .catch(error => {
                console.error('Error al iniciar sesión:', error);
                // Manejar el error adecuadamente, por ejemplo, mostrar un mensaje al usuario
            });
}

// Función para registrar un nuevo usuario
function registrarUsuario(correoElectronico, password) {
    var datosUsuario = {
        correoElectronico: correoElectronico,
        password: password
    };

    fetch('/usuario/registrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en el registro');
                }
                return response.json();
            })
            .then(data => {
                // Guardar el token JWT y el nombre del usuario en localStorage
                localStorage.setItem('tokenJWT', data.jwtToken);
                localStorage.setItem('nombreUsuario', data.nombreUsuario);

                // Actualizar el navbar con el nombre del usuario autenticado
                actualizarNavbar(data);

                // Redirigir al index
                window.location.href = '/'; // redirige al index o a donde sea necesario
            })
            .catch(error => {
                console.error('Error al registrar:', error);
                // Manejar el error adecuadamente, por ejemplo, mostrar un mensaje al usuario
            });
}

// Función para marcar una respuesta como solución
function marcarSolucion(idRespuesta) {
    fetch('/respuesta/marcarSolucion/' + idRespuesta, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenJWT
        }
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al marcar la respuesta como solución');
                }
                return response.json();
            })
            .then(data => {
                console.log('Respuesta marcada como solución:', data);
                actualizarInterfazUsuario(idRespuesta, true);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error al marcar la respuesta como solución:', error);
            });
}

// Función para desmarcar una respuesta como solución
function desmarcarSolucion(idRespuesta) {
    fetch('/respuesta/desmarcarSolucion/' + idRespuesta, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenJWT
        }
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al desmarcar la respuesta como solución');
                }
                return response.json();
            })
            .then(data => {
                console.log('Respuesta desmarcada como solución:', data);
                actualizarInterfazUsuario(idRespuesta, false);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error al desmarcar la respuesta como solución:', error);
            });
}

// Función para actualizar la interfaz de usuario según si una respuesta es solución o no
function actualizarInterfazUsuario(idRespuesta, esSolucion) {
    var botonMarcar = document.getElementById(`btn-marcar-${idRespuesta}`);
    var spanSolucion = document.getElementById(`span-solucion-${idRespuesta}`);
    var botonDesmarcar = document.getElementById(`btn-desmarcar-${idRespuesta}`);

    if (esSolucion) {
        if (botonMarcar)
            botonMarcar.style.display = 'none';
        if (spanSolucion) {
            spanSolucion.style.display = 'inline';
            if (botonDesmarcar)
                botonDesmarcar.style.display = 'inline';
        }
    } else {
        if (botonMarcar)
            botonMarcar.style.display = 'inline';
        if (spanSolucion) {
            spanSolucion.style.display = 'none';
            if (botonDesmarcar)
                botonDesmarcar.style.display = 'none';
        }
    }
}

// Función para manejar el logout del usuario
function logout() {
    localStorage.removeItem('tokenJWT');
    localStorage.removeItem('nombreUsuario');
    window.location.href = '/';
}

// Función para obtener y manejar los detalles de un tópico
function obtenerDetalleTopico(id) {
    console.log("Añadiendo encabezado Authorization a la solicitud de detalle con ID:", id);
    fetch('/detalle/' + id, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + tokenJWT
        }
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la autenticación');
                }
                return response.text();
            })
            .then(data => {
                // Cambia la URL sin recargar la página
                window.history.pushState({}, '', '/detalle/' + id);
                // Inserta el contenido recibido en el DOM
                document.body.innerHTML = data;
            })
            .catch(error => {
                console.error('Error al hacer la solicitud:', error);
            });
}

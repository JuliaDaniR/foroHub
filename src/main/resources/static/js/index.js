var tokenJWT = localStorage.getItem('tokenJWT');
console.log('Token JWT:', tokenJWT);

// Función para alternar el menú de navegación
function toggleMenu() {
    var navbarLinks = document.getElementById("navbarLinks");
    navbarLinks.classList.toggle("active");
    if (window.innerWidth > 768) {
        navbarLinks.classList.remove("active");
    }
    console.log('Menú alternado');
}

// Función para mostrar u ocultar subcategorías según el botón
function mostrarSubcategorias(button) {
    var categoria = button.value;
    var subcategorias = document.getElementById('subcategorias-' + categoria);
    subcategorias.style.display = subcategorias.style.display === 'none' ? 'block' : 'none';
    console.log('Subcategorías de ' + categoria + ' mostradas/ocultadas');
}

// Función para actualizar subcategorías dinámicamente
document.addEventListener("DOMContentLoaded", function () {
    actualizarSubcategorias();
});

function actualizarSubcategorias() {
    var categoriaSeleccionada = document.getElementById('categoria').value;
    var subcategoriasPorCategoria = /*[[${subcategoriasPorCategoria}]]*/ {};
    console.log("Categoría seleccionada:", categoriaSeleccionada);
    console.log("Subcategorías por categoría:", subcategoriasPorCategoria);

    var subcategorias = subcategoriasPorCategoria[categoriaSeleccionada];
    var subcategoriaSelect = document.getElementById('subcategoria');
    subcategoriaSelect.innerHTML = ''; // Limpiar opciones actuales

    if (subcategorias) {
        subcategorias.forEach(function (subcategoria) {
            var option = document.createElement('option');
            option.value = subcategoria;
            option.text = subcategoria;
            subcategoriaSelect.appendChild(option);
        });
    } else {
        console.log("Categoría no encontrada o subcategoriasPorCategoria es nulo:", categoriaSeleccionada);
    }
}

// Función para registrar un nuevo curso
function registrarCurso(event) {
    event.preventDefault();

    var token = localStorage.getItem('token'); // Obtener el token del localStorage (o sessionStorage)
    if (!token) {
        alert('No se ha encontrado el token de autenticación.');
        return;
    }

    var cursoForm = {
        nombre: document.getElementById('nombre').value,
        categoriaPrincipal: document.getElementById('categoria').value,
        subcategoria: document.getElementById('subcategoria').value
    };

    fetch('/curso/registrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token // Añadir el token en el encabezado de la solicitud
        },
        body: JSON.stringify(cursoForm)
    })
            .then(response => {
                if (response.ok) {
                    window.location.href = "/";
                } else {
                    console.error('Error en el registro del curso:', response.statusText);
                }
            })
            .catch(error => console.error('Error en el registro del curso:', error));
}

// Función para enviar un nuevo tópico
function enviarNuevoTopico(event) {
    event.preventDefault(); // Prevenir el envío del formulario tradicional

    var formData = {
        titulo: document.getElementById('titulo').value,
        mensaje: document.getElementById('mensaje').value,
        cursoId: document.getElementById('cursoId').value
    };

    fetch('/registrarTopico', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenJWT
        },
        body: JSON.stringify(formData)
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al registrar el tópico');
                    window.location.href = '/login';
                }
                return response.json();
            })
            .then(data => {
                console.log('Tópico registrado:', data);
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Error al registrar el tópico:', error);
                window.location.href = '/login';
                mostrarMensajeError('Error al registrar el tópico. Por favor, inténtalo nuevamente.');
            });
}

// Evento que se dispara cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM completamente cargado');

    // Ejemplo de solicitud fetch para obtener tópicos mostrados en la navegación
    fetch('/mostrarTopicos', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + tokenJWT
        }
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la autenticación');
                }
                return response.json();
            })
            .then(data => {
                console.log("Respuesta del endpoint mostrarTopicos", data);
                // Actualización de la interfaz con nombre de usuario y enlace de logout
                var navbarLinks = document.getElementById('navbarLinks');
                var nombreUsuario = document.createElement('span');
                nombreUsuario.textContent = 'Bienvenido, ' + data.username;
                nombreUsuario.className = 'usuario-autenticado';
                navbarLinks.innerHTML = '';
                navbarLinks.appendChild(nombreUsuario);
                var logoutLink = document.createElement('a');
                logoutLink.href = '/logout';
                logoutLink.textContent = 'Logout';
                navbarLinks.appendChild(logoutLink);
            })
            .catch(error => {
                console.error('Error al hacer la solicitud de mostrarTopicos:', error);
            });

    // Agregar evento click a todos los botones 'ver-mas-btn'
    document.querySelectorAll('.ver-mas-btn').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var url = link.getAttribute('href');
            var idMatch = url.match(/\/detalle\/(\d+)/);
            if (!idMatch) {
                console.error('URL incorrecta para detalleTopico:', url);
                return;
            }
            var id = idMatch[1];
            console.log("Añadiendo encabezado Authorization a la solicitud de detalle con ID:", id);
            // Ejemplo de solicitud fetch para detalle de un tópico específico
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
                        console.log('Contenido del detalle recibido y actualizado en el DOM');
                    })
                    .catch(error => {
                        console.error('Error al hacer la solicitud de detalle:', error);
                    });
        });
    });

    // Asignar la función de envío al formulario
    var formNuevoTopico = document.getElementById('formNuevoTopico');
    if (formNuevoTopico) {
        formNuevoTopico.addEventListener('submit', enviarNuevoTopico);
    }
});

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
            })
            .catch(error => {
                console.error('Error al desmarcar la respuesta como solución:', error);
            });
}

// Función para actualizar la interfaz de usuario después de marcar/desmarcar una solución
function actualizarInterfazUsuario(idRespuesta, esSolucion) {
    var listaRespuestas = document.querySelectorAll('.lista-respuestas');
    listaRespuestas.forEach(function (respuesta) {
        var botonMarcar = respuesta.querySelector('button[id^="btn-marcar-"]');
        var spanSolucion = respuesta.querySelector('span[id^="span-solucion-"]');
        var botonDesmarcar = respuesta.querySelector('button[id^="btn-desmarcar-"]');
        if (esSolucion) {
            if (respuesta.querySelector(`#btn-marcar-${idRespuesta}`)) {
                if (botonMarcar) {
                    botonMarcar.style.display = 'none';
                }
                if (spanSolucion) {
                    spanSolucion.style.display = 'inline';
                } else {
                    spanSolucion = document.createElement('span');
                    spanSolucion.id = `span-solucion-${idRespuesta}`;
                    spanSolucion.textContent = 'Solución marcada ';
                    spanSolucion.style.display = 'inline';
                    if (botonMarcar) {
                        botonMarcar.insertAdjacentElement('afterend', spanSolucion);
                    }
                }
                if (botonDesmarcar) {
                    botonDesmarcar.style.display = 'inline';
                } else {
                    botonDesmarcar = document.createElement('button');
                    botonDesmarcar.id = `btn-desmarcar-${idRespuesta}`;
                    botonDesmarcar.textContent = 'Desmarcar';
                    botonDesmarcar.onclick = function () {
                        desmarcarSolucion(idRespuesta);
                    };
                    spanSolucion.appendChild(botonDesmarcar);
                }
            } else {
                if (botonMarcar) {
                    botonMarcar.style.display = 'none';
                }
            }
        } else {
            if (botonMarcar) {
                botonMarcar.style.display = 'inline';
            }
            if (spanSolucion) {
                spanSolucion.style.display = 'none';
            }
            if (botonDesmarcar) {
                botonDesmarcar.style.display = 'none';
            }
        }
    });
    console.log('Interfaz de usuario actualizada para la respuesta con ID:', idRespuesta);
}

// Función para enviar una respuesta a un tópico
function enviarRespuesta() {
    var mensaje = document.querySelector('#formNuevaRespuesta textarea[name="mensaje"]').value;
    var topicoId = document.querySelector('#formNuevaRespuesta input[name="topicoId"]').value;
    var autorId = document.querySelector('#formNuevaRespuesta input[name="autorId"]').value;

    if (!autorId) {
        // Manejar el caso en que autorId no esté disponible
        console.error('No se pudo obtener el autorId');
        return; // O mostrar un mensaje al usuario, según sea necesario
    }

    var tokenJWT = localStorage.getItem('tokenJWT');
    var data = {
        mensaje: mensaje,
        topicoId: topicoId,
        autorId: autorId
    };

    fetch('/foro/respuesta/registrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenJWT
        },
        body: JSON.stringify(data)
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al registrar la respuesta');
                }
                return response.json();
            })
            .then(data => {
                console.log('Respuesta registrada:', data);
                // Actualizar dinámicamente la interfaz de usuario con la respuesta registrada
                actualizarInterfazUsuarioRespuesta(data);
            })
            .catch(error => {
                console.error('Error al registrar la respuesta:', error);
                mostrarMensajeError('Error al registrar la respuesta. Por favor, inténtalo nuevamente.');
            });
}

// Función para actualizar dinámicamente la interfaz de usuario con la respuesta registrada
function actualizarInterfazUsuarioRespuesta(respuestaRegistrada) {
    var listaRespuestas = document.querySelector('#listaRespuestas');
    if (!listaRespuestas) {
        console.error('Elemento #listaRespuestas no encontrado en el DOM.');
        mostrarMensajeError('Error al mostrar la respuesta. Por favor, inténtalo nuevamente.');
        return;
    }

    var nuevaRespuestaHTML = `
            <li class="lista-respuestas">
                <p>${respuestaRegistrada.mensaje}</p>
                <p>Usuario: ${respuestaRegistrada.nombreAutor}</p>
                <p>Fecha: ${respuestaRegistrada.fechaCreacion}</p>
            </li>
        `;
    // Agregar el nuevo HTML al final de la lista de respuestas
    listaRespuestas.insertAdjacentHTML('beforeend', nuevaRespuestaHTML);
    // Limpiar el campo de texto después de enviar la respuesta
    document.querySelector('#formNuevaRespuesta textarea[name="mensaje"]').value = '';
    // Opcional: Mostrar mensaje de éxito
    var mensajeExitoRespuesta = document.querySelector('.mensaje-exito-respuesta');
    if (mensajeExitoRespuesta) {
        mensajeExitoRespuesta.style.display = 'block'; // Mostrar el mensaje de éxito si está oculto
        mensajeExitoRespuesta.textContent = '¡Respuesta registrada correctamente!';
    }
}

// Función para mostrar mensaje de error
function mostrarMensajeError(mensaje) {
    // Implementación del mensaje de error según tus necesidades
    alert('Error: ' + mensaje);
}

// Configuración global de jQuery para agregar el encabezado JWT en las solicitudes
$(document).ready(function () {
    $.ajaxSetup({
        beforeSend: function (xhr) {
            var tokenJWT = localStorage.getItem('tokenJWT');
            if (tokenJWT) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + tokenJWT);
            }
        }
    });
    console.log('Configuración global de jQuery completada');
});


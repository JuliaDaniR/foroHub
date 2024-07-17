function toggleMenu() {
    var navbarLinks = document.getElementById("navbarLinks");
    navbarLinks.classList.toggle("active");
}

document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    var correoElectronico = document.querySelector("input[name='correoElectronico']").value;
    var password = document.querySelector("input[name='password']").value;

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

                // Actualizar el navbar
                actualizarNavbar();

                // Redirigir al index
                window.location.href = '/inicio'; // redirige al index o a donde sea necesario
            })
            .catch(error => {
                console.error('Error al iniciar sesión:', error);
                // Manejar el error adecuadamente, por ejemplo, mostrar un mensaje al usuario
            });
});

function actualizarNavbar() {
    var nombreUsuario = localStorage.getItem('nombreUsuario');

    if (nombreUsuario) {
        document.getElementById('navbarLinks').innerHTML = `
                    <span>Bienvenido, ${nombreUsuario}</span>
                    <a href="#" onclick="logout()">Logout</a>
                `;
    }
}

function logout() {
    localStorage.removeItem('tokenJWT');
    localStorage.removeItem('nombreUsuario');
    window.location.href = '/';
}

// Llama a actualizarNavbar() al cargar la página para verificar si el usuario está autenticado
document.addEventListener('DOMContentLoaded', actualizarNavbar);

// Función para agregar el token JWT en el encabezado de todas las solicitudes AJAX
function addJWTHeader(xhr) {
    var tokenJWT = localStorage.getItem('tokenJWT'); // Obtener el token JWT desde localStorage
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



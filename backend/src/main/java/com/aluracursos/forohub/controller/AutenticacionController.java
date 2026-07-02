package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.security.DatosAutenticacionUsuario;
import com.aluracursos.forohub.security.DatosJWTtoken;
import com.aluracursos.forohub.security.TokenService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/login")
@RequiredArgsConstructor
public class AutenticacionController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    @PostMapping
    public ResponseEntity<DatosJWTtoken> autenticarUsuario(@RequestBody DatosAutenticacionUsuario datosAutenticacionUsuario) {
        Authentication authenticationToken = new UsernamePasswordAuthenticationToken(datosAutenticacionUsuario.correoElectronico(), datosAutenticacionUsuario.password());
        Authentication usuarioAutenticado = authenticationManager.authenticate(authenticationToken);
        Usuario usuario = (Usuario) usuarioAutenticado.getPrincipal();
        String tokenJWT = tokenService.generarToken(usuario);
        DatosJWTtoken response = new DatosJWTtoken(tokenJWT, usuario.getNombre(), usuario.getId(), usuario.getPerfil().name());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/redirect")
    public void redirectAfterLogin(HttpServletResponse response) throws IOException {
        response.sendRedirect("/inicio");
    }
}

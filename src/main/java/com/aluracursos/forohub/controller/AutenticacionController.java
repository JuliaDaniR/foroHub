package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.security.DatosAutenticacionUsuario;
import com.aluracursos.forohub.security.DatosJWTtoken;
import com.aluracursos.forohub.security.TokenService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class AutenticacionController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @PostMapping
    public ResponseEntity<DatosJWTtoken> autenticarUsuario(@RequestBody DatosAutenticacionUsuario datosAutenticacionUsuario) {
        Authentication authenticationToken = new UsernamePasswordAuthenticationToken(datosAutenticacionUsuario.correoElectronico(), datosAutenticacionUsuario.password());
        System.out.println("******authenticationToken***" + authenticationToken);
        Authentication usuarioAutenticado = authenticationManager.authenticate(authenticationToken);
        System.out.println("*********usuarioAutenticado*******"+ usuarioAutenticado);
        String tokenJWT = tokenService.generarToken((Usuario) usuarioAutenticado.getPrincipal());
        System.out.println("**********tokenJWT" + tokenJWT);
        DatosJWTtoken response = new DatosJWTtoken(tokenJWT, ((Usuario) usuarioAutenticado.getPrincipal()).getNombre());
        System.out.println("******response "+ response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/redirect")
    public void redirectAfterLogin(HttpServletResponse response) throws IOException {
        response.sendRedirect("/");
    }
}

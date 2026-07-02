package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.dto.DatosRegistroUsuario;
import com.aluracursos.forohub.dto.DatosRespuestaUsuario;
import com.aluracursos.forohub.dto.DatosLeaderboardUsuario;
import com.aluracursos.forohub.service.UsuarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/usuario")
@SecurityRequirement(name = "bearer-key")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/registrar")
    public ResponseEntity<DatosRespuestaUsuario> registrarUsuario(
            @RequestBody @Valid DatosRegistroUsuario datosRegistroUsuario,
            UriComponentsBuilder uriComponentsBuilder) {

        DatosRespuestaUsuario datosRespuestaUsuario = usuarioService.registrarUsuario(datosRegistroUsuario);
        URI url = uriComponentsBuilder.path("/usuario/{id}").buildAndExpand(datosRespuestaUsuario.id()).toUri();
        return ResponseEntity.created(url).body(datosRespuestaUsuario);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<DatosLeaderboardUsuario>> obtenerLeaderboard() {
        return ResponseEntity.ok(usuarioService.obtenerLeaderboard());
    }
}

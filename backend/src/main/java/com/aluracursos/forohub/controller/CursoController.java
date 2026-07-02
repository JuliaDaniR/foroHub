package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.dto.DatosActualizarCurso;
import com.aluracursos.forohub.dto.DatosListadoCurso;
import com.aluracursos.forohub.dto.DatosRegistroCurso;
import com.aluracursos.forohub.service.CursoService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/curso")
@SecurityRequirement(name = "bearer-key")
public class CursoController {

    @Autowired
    private CursoService cursoService;

    @PostMapping("/registrar")
    public ResponseEntity registrarCurso(@RequestBody @Valid DatosRegistroCurso datosRegistroCurso, UriComponentsBuilder uriComponentsBuilder) {
        DatosRegistroCurso datosRespuesta = cursoService.registrarCurso(datosRegistroCurso);
        URI url = uriComponentsBuilder.path("/curso/{id}").buildAndExpand(datosRespuesta.id()).toUri();
        return ResponseEntity.created(url).body(datosRegistroCurso);
    }

    @GetMapping("/listar")
    public ResponseEntity<Page<DatosListadoCurso>> listarCursos(
            @PageableDefault(size = 10, sort = "nombre", direction = Sort.Direction.ASC) Pageable paginacion) {
        Page<DatosListadoCurso> datosListadoCurso = cursoService.listarCursos(paginacion);
        return ResponseEntity.ok().body(datosListadoCurso);
    }

    @PutMapping("/actualizar")
    @Transactional
    public ResponseEntity actualizarCurso(@RequestBody @Valid DatosActualizarCurso datos) {
        DatosListadoCurso datosRespuesta = cursoService.actualizarCurso(datos);
        return ResponseEntity.ok(datosRespuesta);
    }

    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity eliminarCurso(@PathVariable Long id) {
        cursoService.eliminarCurso(id);
        return ResponseEntity.noContent().build();
    }
}

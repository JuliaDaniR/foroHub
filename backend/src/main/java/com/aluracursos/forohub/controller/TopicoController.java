package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.dto.DatosListadoTopico;
import com.aluracursos.forohub.dto.DatosRegistroTopico;
import com.aluracursos.forohub.dto.DatosRespuestaTopico;
import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.service.TopicoService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/topico")
@SecurityRequirement(name = "bearer-key")
@RequiredArgsConstructor
public class TopicoController {

    private final TopicoService topicoService;

    @PostMapping
    public ResponseEntity registrarTopico(@RequestBody @Valid DatosRegistroTopico datosRegistroTopico, UriComponentsBuilder uriComponentsBuilder) {
        DatosListadoTopico datosRespuestaRegistroTopico = topicoService.registrarTopico(datosRegistroTopico);
        URI url = uriComponentsBuilder.path("/topico/{id}").buildAndExpand(datosRespuestaRegistroTopico.id()).toUri();
        return ResponseEntity.created(url).body(datosRespuestaRegistroTopico);
    }

    @GetMapping("/listar")
    public ResponseEntity<Page<DatosListadoTopico>> listarTopico(
            @PageableDefault(size = 10, sort = "fechaCreacion", direction = Sort.Direction.ASC) Pageable paginacion) {

        Page<DatosListadoTopico> datosListadoTopicos = topicoService.listarTopicos(paginacion);
        return ResponseEntity.ok().body(datosListadoTopicos);
    }

    @GetMapping("/listarPorCurso")
    public ResponseEntity<?> listarTopicoPorCursoYFecha(
            @RequestParam(required = false) Categoria categoriaPrincipal,
            @RequestParam int anio,
            @PageableDefault(size = 10, sort = {"curso.categoriaPrincipal", "fechaCreacion"}, direction = Sort.Direction.ASC) Pageable pageable) {

        Page<DatosListadoTopico> datosListadoTopicos = topicoService.listarPorCursoYFecha(categoriaPrincipal,anio,pageable);
        return ResponseEntity.ok().body(datosListadoTopicos);
    }

    @PutMapping("/actualizar")
    @Transactional
    public ResponseEntity actualizarTopico(@RequestBody @Valid DatosRegistroTopico.DatosActualizarTopico datosActualizarTopico) {
        try{
            DatosRespuestaTopico datosTopico = topicoService.actualizarTopico(datosActualizarTopico);
            return ResponseEntity.ok(datosTopico);
        } catch (
                EntityNotFoundException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al actualizar la respuesta.");
        }
    }

    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity eliminarTopico(@PathVariable Long id) {
        try {
            topicoService.eliminarTopico(id);
            return ResponseEntity.ok("El topico se eliminó exitosamente");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró un tópico con el ID proporcionado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al intentar eliminar el tópico.");
        }
    }

    @DeleteMapping("/baja/{id}")
    @Transactional
    public ResponseEntity darDeBajaTopico(@PathVariable Long id) {
        try {
            topicoService.darDeBajaTopico(id);
            return ResponseEntity.ok("El topico se dió de baja exitosamente");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró un tópico con el ID proporcionado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al intentar dar de baja el tópico.");
        }
    }

    @GetMapping("/alta/{id}")
    @Transactional
    public ResponseEntity darDeAltaTopico(@PathVariable Long id) {
        try {
            topicoService.darDeAltaTopico(id);
            return ResponseEntity.ok("El topico se dió de alta exitosamente");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró un tópico con el ID proporcionado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al intentar dar de baja el tópico.");
        }
    }

    @GetMapping("/detalle/{id}")
    public ResponseEntity retornarDatosTopico(@PathVariable Long id) {
        try{
            DatosRespuestaTopico datosTopico = topicoService.retornarDatosTopico(id);
            return ResponseEntity.ok(datosTopico);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró un tópico con el ID proporcionado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al intentar dar de baja el tópico.");
        }
    }
}

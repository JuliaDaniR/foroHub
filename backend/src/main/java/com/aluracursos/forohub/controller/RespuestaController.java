package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.dto.DatosRegistroRespuestas;
import com.aluracursos.forohub.dto.DatosRespuestaRespuestas;
import com.aluracursos.forohub.service.RespuestaService;
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
@RequestMapping("/respuesta")
@SecurityRequirement(name = "bearer-key")
@RequiredArgsConstructor
public class RespuestaController {

    private final RespuestaService respuestaService;

    @PostMapping("/registrar")
    public ResponseEntity<DatosRespuestaRespuestas> registrarRespuesta(@RequestBody @Valid DatosRegistroRespuestas datosRegistroRespuesta, UriComponentsBuilder uriComponentsBuilder) {
        DatosRespuestaRespuestas datosRespuesta = respuestaService.registrarServicio(datosRegistroRespuesta);
        URI url = uriComponentsBuilder.path("/respuesta/{id}").buildAndExpand(datosRespuesta.id()).toUri();
        return ResponseEntity.created(url).body(datosRespuesta);
    }

    @GetMapping("/listar")
    public ResponseEntity<Page<DatosRespuestaRespuestas>> listarRespuestas(
            @PageableDefault(size = 10, sort = "fechaCreacion", direction = Sort.Direction.ASC) Pageable paginacion) {
        Page<DatosRespuestaRespuestas> datosRespuesta = respuestaService.listarRespuestas(paginacion);
        return ResponseEntity.ok().body(datosRespuesta);
    }

    @GetMapping("/listarPorTopico/{topicoId}")
    public ResponseEntity<Page<DatosRespuestaRespuestas>> listarRespuestaPorTopico(
            @PathVariable Long topicoId,
            @PageableDefault(size = 10, sort = "fechaCreacion", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<DatosRespuestaRespuestas> datosRespuesta = respuestaService.listarRespuestasPorTopico(topicoId, pageable);
        if (datosRespuesta.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(datosRespuesta);
    }

    @PutMapping("/actualizar")
    @Transactional
    public ResponseEntity<?> actualizar(@RequestBody @Valid DatosRegistroRespuestas.DatosActualizarRespuestas datosActualizarRespuesta) {
        try {
            DatosRespuestaRespuestas respuestaActualizada = respuestaService.actualizar(datosActualizarRespuesta);
            return ResponseEntity.ok(respuestaActualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al actualizar la respuesta.");
        }
    }

    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity<String> eliminarRespuesta(@PathVariable Long id) {
        try {
            respuestaService.eliminarRespuesta(id);
            return ResponseEntity.ok("La respuesta se eliminó exitosamente.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró una respuesta con el ID proporcionado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al intentar eliminar la respuesta.");
        }
    }

    @DeleteMapping("/baja/{id}")
    @Transactional
    public ResponseEntity<String> darDeBajaRespuesta(@PathVariable Long id) {
        try {
            respuestaService.darDeBajaRespuesta(id);
            return ResponseEntity.ok("La respuesta se dio de baja exitosamente.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró una respuesta con el ID proporcionado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al intentar dar de baja la respuesta.");
        }
    }

    @GetMapping("/solucion/{id}")
    @Transactional
    public ResponseEntity<String> marcarComoSolucion(@PathVariable Long id) {
        try {
            respuestaService.marcarComoSolucion(id);
            return ResponseEntity.ok("La respuesta fue marcada como solución al tópico.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al marcar la respuesta como solución.");
        }
    }


    @GetMapping("/detalle/{id}")
    public ResponseEntity<Object> retornarDatosRespuesta(@PathVariable Long id) {
        try {
            DatosRespuestaRespuestas datosRespuesta = respuestaService.retornarDatosRespuesta(id);
            return ResponseEntity.ok(datosRespuesta);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al obtener los datos de la respuesta.");
        }
    }
}

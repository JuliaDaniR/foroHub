package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.DTO.DatosListadoTopico;
import com.aluracursos.forohub.DTO.DatosRegistroTopico;
import com.aluracursos.forohub.DTO.DatosRespuestaRespuestas;
import com.aluracursos.forohub.DTO.DatosRespuestaTopico;
import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.repository.ITopicoRepository;
import com.aluracursos.forohub.service.TopicoService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/topico")
@SecurityRequirement(name = "bearer-key")
public class TopicoController {

    @Autowired
    private ITopicoRepository topicoRepo;

    @Autowired
    private TopicoService topicoService;

    @PostMapping
    public ResponseEntity registrarTopico(@RequestBody @Valid DatosRegistroTopico datosRegistroTopico, UriComponentsBuilder uriComponentsBuilder) {

        Topico topico = topicoService.registrarTopico(datosRegistroTopico);

        if (topico != null) {
            DatosRegistroTopico datosRespuestaTopico = new DatosRegistroTopico(
                    topico.getTitulo(),
                    topico.getMensaje(),
                    topico.getAutor().getId(),
                    topico.getCurso().getId()
            );

            URI url = uriComponentsBuilder.path("/topico/{id}").buildAndExpand(topico.getId()).toUri();

            return ResponseEntity.created(url).body(datosRespuestaTopico);

        } else {

            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un tópico con ese título y mensaje");
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<Page<DatosListadoTopico>> listarTopico(
            @PageableDefault(size = 10, sort = "fechaCreacion", direction = Sort.Direction.ASC) Pageable paginacion) {

        Page<Topico> topicos = topicoRepo.findByStatusTrue(paginacion);
        Page<DatosListadoTopico> datosListadoTopicos = topicos.map(DatosListadoTopico::new);
        return ResponseEntity.ok().body(datosListadoTopicos);
    }

    @GetMapping("/listarPorCurso")
    public ResponseEntity<?> listarTopicoPorCursoYFecha(
            @RequestParam(required = false) Categoria categoriaPrincipal,
            @RequestParam int anio,
            @PageableDefault(size = 10, sort = {"curso.categoriaPrincipal", "fechaCreacion"}, direction = Sort.Direction.ASC) Pageable pageable) {

        Page<Topico> topicos;

        if (categoriaPrincipal != null) {
            topicos = topicoRepo.findByCursoCategoriaPrincipalAndAnio(categoriaPrincipal, anio, pageable);
        } else {
            topicos = topicoRepo.findByFechaCreacionYear(anio, pageable);
        }

        if (topicos.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("No se encontraron resultados para la categoría principal proporcionada.");
        }

        Page<DatosListadoTopico> datosListadoTopicos = topicos.map(DatosListadoTopico::new);
        return ResponseEntity.ok().body(datosListadoTopicos);
    }

    @PutMapping("/actualizar")
    @Transactional
    public ResponseEntity actualizarTopico(@RequestBody @Valid DatosRegistroTopico.DatosActualizarTopico datosActualizarTopico) {
        Optional<Topico> topicoOptional = topicoRepo.findById(datosActualizarTopico.id());

        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topico.actualizarDatos(datosActualizarTopico);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
             List<DatosRespuestaRespuestas> respuestasDTO = topico.getRespuestas().stream().map(respuesta
                    -> new DatosRespuestaRespuestas(
                            respuesta.getId(),
                            respuesta.getMensaje(),
                            respuesta.getFechaCreacion().format(formatter),
                            respuesta.getSolucion(),
                            respuesta.getAutor().getNombre(),
                            respuesta.getAutor().getPerfil(),
                            respuesta.getTopico().getTitulo()
                    )
            ).collect(Collectors.toList());
            DatosRespuestaTopico datosTopico = new DatosRespuestaTopico(
                    topico.getId(),
                    topico.getTitulo(),
                    topico.getMensaje(),
                    topico.getFechaCreacion().format(formatter),
                    topico.getAutor().getNombre(),
                    topico.getCurso().getNombre(),
                    respuestasDTO
            );
              return ResponseEntity.ok(datosTopico);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("No se encontró un topico con el id proporcionado.");
        }
    }

    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity eliminarTopico(@PathVariable Long id) {
        Optional<Topico> topicoOptional = topicoRepo.findById(id);
        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topicoRepo.deleteById(topico.getId());
            return ResponseEntity.ok().body("El topico se eliminó exitosamente");
        }

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/baja/{id}")
    @Transactional
    public ResponseEntity darDeBajaTopico(@PathVariable Long id) {
        Optional<Topico> topicoOptional = topicoRepo.findById(id);
        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topico.desactivarTopico();
            return ResponseEntity.ok().body("El topico se dió de baja exitosamente");
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alta/{id}")
    @Transactional
    public ResponseEntity darDeAltaTopico(@PathVariable Long id) {
        Optional<Topico> topicoOptional = topicoRepo.findById(id);
        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topico.activarTopico();
            return ResponseEntity.ok().body("El topico se dió de alta exitosamente");
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/detalle/{id}")
    public ResponseEntity retornarDatosTopico(@PathVariable Long id) {
        Optional<Topico> optionalTopico = topicoRepo.findById(id);
        if (optionalTopico.isPresent()) {
            Topico topico = optionalTopico.get();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

             List<DatosRespuestaRespuestas> respuestasDTO = topico.getRespuestas().stream().map(respuesta
                    -> new DatosRespuestaRespuestas(
                            respuesta.getId(),
                            respuesta.getMensaje(),
                            respuesta.getFechaCreacion().format(formatter),
                            respuesta.getSolucion(),
                            respuesta.getAutor().getNombre(),
                            respuesta.getAutor().getPerfil(),
                            respuesta.getTopico().getTitulo()
                    )
            ).collect(Collectors.toList());

            DatosRespuestaTopico datosTopico = new DatosRespuestaTopico(
                    topico.getId(),
                    topico.getTitulo(),
                    topico.getMensaje(),
                    topico.getFechaCreacion().format(formatter),
                    topico.getAutor().getNombre(),
                    topico.getCurso().getNombre(),
                    respuestasDTO
            );
            return ResponseEntity.ok(datosTopico);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró ningún tópico con el ID proporcionado.");
        }
    }

}

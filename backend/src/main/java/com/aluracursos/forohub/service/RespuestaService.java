package com.aluracursos.forohub.service;

import com.aluracursos.forohub.dto.DatosRegistroRespuestas;
import com.aluracursos.forohub.dto.DatosRespuestaRespuestas;
import com.aluracursos.forohub.model.Respuesta;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.RespuestaRepository;
import com.aluracursos.forohub.repository.TopicoRepository;
import com.aluracursos.forohub.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class RespuestaService {

    private final RespuestaRepository respuestaRepo;
    private final UsuarioRepository usuarioRepository;
    private final TopicoRepository topicoRepo;

    @Transactional
    public DatosRespuestaRespuestas registrarServicio(DatosRegistroRespuestas datosRegistroRespuesta) {

        Long topicoId = datosRegistroRespuesta.topicoId();
        Topico topico = topicoRepo.findById(topicoId)
                .orElseThrow(() -> new IllegalArgumentException("El curso con ID " + topicoId + " no existe"));

        Long autorId = datosRegistroRespuesta.autorId();
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new IllegalArgumentException("El autor con ID " + autorId + " no existe."));

        Respuesta respuesta = new Respuesta(datosRegistroRespuesta, autor, topico);
        autor.setPuntos(autor.getPuntos() + 2);
        usuarioRepository.save(autor);
        respuestaRepo.save(respuesta);

        return mapearRespuestaADatos(respuesta);
    }
    public Page<DatosRespuestaRespuestas> listarRespuestas(Pageable paginacion) {
        Page<Respuesta> respuestas = respuestaRepo.findByStatusTrue(paginacion);
        return respuestas.map(this::mapearRespuestaADatos);
    }


    public Page<DatosRespuestaRespuestas> listarRespuestasPorTopico(Long topicoId, Pageable pageable) {
        if (topicoId == null) {
            throw new IllegalArgumentException("El ID del tópico no puede ser nulo.");
        }
        Page<Respuesta> respuestas = respuestaRepo.findByTopicoId(topicoId, pageable);
        if (respuestas.isEmpty()) {
            return Page.empty();
        }
        return respuestas.map(this::mapearRespuestaADatos);
    }

    @Transactional
    public DatosRespuestaRespuestas actualizar(DatosRegistroRespuestas.DatosActualizarRespuestas datosActualizarRespuesta) {
        Respuesta respuesta = obtenerRespuestaPorId(datosActualizarRespuesta.id());
        respuesta.actualizarDatos(datosActualizarRespuesta);
        return mapearRespuestaADatos(respuesta);
    }

    @Transactional
    public void eliminarRespuesta(Long id) {
        Respuesta respuesta = obtenerRespuestaPorId(id);
        respuestaRepo.deleteById(respuesta.getId());
    }
    @Transactional
    public void darDeBajaRespuesta(Long id) {
        Respuesta respuesta = obtenerRespuestaPorId(id);
        respuesta.desactivarRespuesta();
        respuestaRepo.save(respuesta);
    }

    public DatosRespuestaRespuestas retornarDatosRespuesta(Long id) {
        Respuesta respuesta = obtenerRespuestaPorId(id);
        return mapearRespuestaADatos(respuesta);
    }

    @Transactional
    public void marcarComoSolucion(Long id) {
        Respuesta respuesta = obtenerRespuestaPorId(id);
        Topico topico = respuesta.getTopico();

        if (Boolean.TRUE.equals(topico.getEstaSolucionado())) {
            throw new IllegalStateException("El tópico ya fue solucionado.");
        }

        respuesta.darRespuestaComoSolucion();
        topico.setEstaSolucionado(Boolean.TRUE);

        Usuario autorRespuesta = respuesta.getAutor();
        autorRespuesta.setPuntos(autorRespuesta.getPuntos() + 20);
        usuarioRepository.save(autorRespuesta);

        respuestaRepo.save(respuesta);
        topicoRepo.save(topico);
    }

    public void desmarcarRespuestaComoSolucion(Long idRespuesta) {
        Respuesta respuesta = obtenerRespuestaPorId(idRespuesta);

        if (!Boolean.TRUE.equals(respuesta.getSolucion())) {
            throw new IllegalStateException("La respuesta no está marcada como solución.");
        }

        respuesta.desmarcarRespuestaComoSolucion();
        respuesta.getTopico().setEstaSolucionado(Boolean.FALSE);

        respuestaRepo.save(respuesta);
        topicoRepo.save(respuesta.getTopico());
    }

    private Respuesta obtenerRespuestaPorId(Long id) {
        return respuestaRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró una respuesta con el ID proporcionado: " + id));
    }

    private DatosRespuestaRespuestas mapearRespuestaADatos(Respuesta respuesta) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        return new DatosRespuestaRespuestas(
                respuesta.getId(),
                respuesta.getMensaje(),
                respuesta.getFechaCreacion().format(formatter),
                respuesta.getSolucion(),
                respuesta.getAutor().getNombre(),
                respuesta.getAutor().getPerfil(),
                respuesta.getTopico().getTitulo()
        );
    }
}

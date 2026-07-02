package com.aluracursos.forohub.service;

import com.aluracursos.forohub.dto.DatosListadoTopico;
import com.aluracursos.forohub.dto.DatosRegistroTopico;
import com.aluracursos.forohub.dto.DatosRespuestaRespuestas;
import com.aluracursos.forohub.dto.DatosRespuestaTopico;
import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.model.Respuesta;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.CursoRepository;
import com.aluracursos.forohub.repository.TopicoRepository;
import com.aluracursos.forohub.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.NoResultException;
import jakarta.transaction.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class TopicoService {

    @Autowired
    private TopicoRepository topicoRepository;
    @Autowired
    private CursoRepository cursoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    private static final Logger logger = LoggerFactory.getLogger(TopicoService.class);

    @Transactional
    public DatosListadoTopico registrarTopico(DatosRegistroTopico datosRegistroTopico) {

            // Verificar si el curso existe
            Long cursoId = datosRegistroTopico.cursoId();
            Curso curso = cursoRepository.findById(cursoId)
                    .orElseThrow(() -> new IllegalArgumentException("El curso con ID " + cursoId + " no existe."));
            System.out.println("Curso encontrado: " + curso);

            // Verificar si el autor existe
            Long autorId = datosRegistroTopico.autorId();
            Usuario autor = usuarioRepository.findById(autorId)
                    .orElseThrow(() -> new IllegalArgumentException("El autor con ID " + autorId + " no existe."));
            System.out.println("Autor encontrado: " + autor);

            // Verificar si ya existe un tópico con el mismo título y mensaje
            List<Topico> topicos = topicoRepository.findAll();
            for (Topico topico : topicos) {
                if (topico.getTitulo().equalsIgnoreCase(datosRegistroTopico.titulo())
                        && topico.getMensaje().equalsIgnoreCase(datosRegistroTopico.mensaje())) {
                    System.out.println("Ya existe un tópico con ese título y mensaje");
                    return null; // O puedes lanzar una excepción
                }
            }

            // Si no se encuentra ningún tópico con el mismo título y mensaje, crea y guarda uno nuevo
            Topico nuevoTopico = new Topico(datosRegistroTopico, autor, curso);
            autor.setPuntos(autor.getPuntos() + 5);
            usuarioRepository.save(autor);
            topicoRepository.save(nuevoTopico);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            return new DatosListadoTopico(
                 nuevoTopico.getId(),
                 nuevoTopico.getTitulo(),
                 nuevoTopico.getMensaje(),
                 nuevoTopico.getFechaCreacion(),
                 nuevoTopico.getStatus(),
                 nuevoTopico.getAutor().getNombre(),
                 nuevoTopico.getCurso().getNombre(),
                 nuevoTopico.getEstaSolucionado()
            );
    }

    public List<Topico> buscarPorCategoriaYSubcategoria(Categoria categoria, String subcategoria) {
        logger.info("Buscando temas para categoría {} y subcategoría {}", categoria, subcategoria);
        // Aquí va la lógica para buscar los temas
        List<Topico> temas = topicoRepository.findByCategoriaAndSubcategoria(categoria, subcategoria);
        logger.info("Encontrados {} temas para categoría {} y subcategoría {}", temas.size(), categoria, subcategoria);
        return temas;
    }

    public Boolean tieneRespuestaComoSolucion(Topico get) {
        Topico topico = topicoRepository.getReferenceById(get.getId());
        boolean resultado = false;
        for (Respuesta respuesta : topico.getRespuestas()) {
            if (respuesta.getSolucion().equals(Boolean.TRUE)) {
                resultado = true;
                break;
            }
        }
        return resultado;
    }

    public Boolean perteneceAlUsuario(Topico topico) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
         System.out.println("*************" + authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            return false; // Si no hay autenticación, no pertenece al usuario en sesión
           
        }
        String nombreUsuarioAutenticado = authentication.getName();
        // Comparar el nombre del usuario autenticado con el nombre del autor del tópico
         System.out.println("*************Nombre " + nombreUsuarioAutenticado);
         System.out.println("resultado "+ topico.getAutor().getUsername().equals(nombreUsuarioAutenticado));
        return topico.getAutor().getUsername().equals(nombreUsuarioAutenticado);
    }

    public Topico obtenerTopicoPorId(Long id) {
        return topicoRepository.findById(id).get();
    }

    public Page<DatosListadoTopico> listarTopicos(Pageable paginacion) {
        Page<Topico> topicos = topicoRepository.findByStatusTrue(paginacion);
        return topicos.map(DatosListadoTopico::new);
    }

    public Page<DatosListadoTopico> listarPorCursoYFecha(Categoria categoriaPrincipal, int anio, Pageable pageable) {
        Page<Topico> topicos;
        if (categoriaPrincipal != null) {
            topicos = topicoRepository.findByCursoCategoriaPrincipalAndAnio(categoriaPrincipal, anio, pageable);
        } else {
            topicos = topicoRepository.findByFechaCreacionYear(anio, pageable);
        }
        if (topicos.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron resultados para la categoría principal o el año proporcionados.");
        }
        return topicos.map(DatosListadoTopico::new);
    }

    @Transactional
    public DatosRespuestaTopico actualizarTopico(DatosRegistroTopico.DatosActualizarTopico datosActualizarTopico) {

        Optional<Topico> topicoOptional = topicoRepository.findById(datosActualizarTopico.id());
        DatosRespuestaTopico datosTopico = null;
        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topico.actualizarDatos(datosActualizarTopico);
            datosTopico = mapearADto(topico);
        } else {
            throw new RuntimeException("No se encontró un topico con el id proporcionado.");
        }
        return datosTopico;
    }

    public void eliminarTopico(Long id) {
        Optional<Topico> topicoOptional = topicoRepository.findById(id);
        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topicoRepository.deleteById(topico.getId());
        }
    }

    public void darDeBajaTopico(Long id) {
        Optional<Topico> topicoOptional = topicoRepository.findById(id);
        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topico.desactivarTopico();
        }
    }

    public void darDeAltaTopico(Long id) {
        Optional<Topico> topicoOptional = topicoRepository.findById(id);
        if (topicoOptional.isPresent()) {
            Topico topico = topicoOptional.get();
            topico.activarTopico();
        }
    }

    public DatosRespuestaTopico retornarDatosTopico(Long id) {
        Optional<Topico> optionalTopico = topicoRepository.findById(id);
        DatosRespuestaTopico datosTopico = null;
        if (optionalTopico.isPresent()) {
            Topico topico = optionalTopico.get();
            datosTopico = mapearADto(topico);
        } else {
            throw new NoResultException("No se encontró ningún tópico con el ID proporcionado.");
        }
        return datosTopico;
    }

    private DatosRespuestaTopico mapearADto(Topico topico){
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

        return new DatosRespuestaTopico(
                topico.getId(),
                topico.getTitulo(),
                topico.getMensaje(),
                topico.getFechaCreacion().format(formatter),
                topico.getAutor().getNombre(),
                topico.getCurso().getNombre(),
                respuestasDTO
        );
    }
}

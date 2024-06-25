package com.aluracursos.forohub.service;

import com.aluracursos.forohub.DTO.DatosRegistroTopico;
import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.model.Respuesta;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.ICursoRepository;
import com.aluracursos.forohub.repository.ITopicoRepository;
import com.aluracursos.forohub.repository.IUsuarioRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class TopicoService {

    @Autowired
    private ITopicoRepository topicoRepository;

    @Autowired
    private ICursoRepository cursoRepository;

    @Autowired
    private IUsuarioRepository usuarioRepository;
@Transactional
public Topico registrarTopico(DatosRegistroTopico datosRegistroTopico) {
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
    Topico topicoGuardado = topicoRepository.save(nuevoTopico);
    System.out.println("Tópico guardado: " + topicoGuardado);

    return topicoGuardado;
}


    private static final Logger logger = LoggerFactory.getLogger(TopicoService.class);

    public List<Topico> buscarPorCategoriaYSubcategoria(Categoria categoria, String subcategoria) {
        logger.info("Buscando temas para categoría {} y subcategoría {}", categoria, subcategoria);
        // Aquí va la lógica para buscar los temas
        List<Topico> temas = topicoRepository.findByCategoriaAndSubcategoria(categoria, subcategoria);
        logger.info("Encontrados {} temas para categoría {} y subcategoría {}", temas.size(), categoria, subcategoria);
        return temas;
    }

    public Boolean tieneRespuestaComoSolucion(Topico get) {
        Topico topico = topicoRepository.getReferenceById(get.getId());
        Boolean resultado = false;
        for (Respuesta respuesta : topico.getRespuestas()) {
            if (respuesta.getSolucion().equals(Boolean.TRUE)) {
                resultado = true;
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
      Topico topico = topicoRepository.findById(id).get();
      return topico;
    }
}

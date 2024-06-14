package com.aluracursos.forohub.service;

import com.aluracursos.forohub.DTO.DatosRegistroTopico;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.model.Usuario;
import com.aluracursos.forohub.repository.ICursoRepository;
import com.aluracursos.forohub.repository.ITopicoRepository;
import com.aluracursos.forohub.repository.IUsuarioRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
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

        System.out.println("cursoId " + cursoId);
        // Verificar si el autor existe
        Long autorId = datosRegistroTopico.autorId();
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new IllegalArgumentException("El autor con ID " + autorId + " no existe."));

        List<Topico> topicos = topicoRepository.findAll();
        for (Topico topico : topicos) {
            if (topico.getTitulo().equalsIgnoreCase(datosRegistroTopico.titulo())
                    && topico.getMensaje().equalsIgnoreCase(datosRegistroTopico.mensaje())) {
                System.out.println("Ya existe un topico con ese titulo y mensaje");
                return null; // O puedes lanzar una excepción
            }
        }
        // Si no se encuentra ningún tópico con el mismo título y mensaje, crea y guarda uno nuevo
        Topico nuevoTopico = new Topico(datosRegistroTopico, autor, curso);
        return topicoRepository.save(nuevoTopico);
    }
 
}

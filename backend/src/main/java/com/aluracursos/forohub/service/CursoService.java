package com.aluracursos.forohub.service;

import com.aluracursos.forohub.dto.DatosActualizarCurso;
import com.aluracursos.forohub.dto.DatosListadoCurso;
import com.aluracursos.forohub.dto.DatosRegistroCurso;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.repository.CursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CursoService {
    
    @Autowired
    private CursoRepository cursoRepo;
    
    public DatosRegistroCurso registrarCurso(DatosRegistroCurso datosRegistroCurso){
        Curso curso = new Curso(datosRegistroCurso);
        cursoRepo.save(curso);
        DatosRegistroCurso datosRespuesta = new DatosRegistroCurso(
                curso.getId(),
                curso.getNombre(),
                curso.getCategoriaPrincipal(),
                curso.getSubcategoria(),
                curso.getDescripcion(),
                curso.getTags());
        return datosRespuesta;
    }

    public Page<DatosListadoCurso> listarCursos(Pageable paginacion) {
        Page<Curso> curso = cursoRepo.findByStatusTrue(paginacion);
        return curso.map(DatosListadoCurso::new);
    }

    public DatosListadoCurso actualizarCurso(DatosActualizarCurso datos) {
        Curso curso = cursoRepo.getReferenceById(datos.id());
        curso.actualizarDatos(datos);
        return new DatosListadoCurso(curso);
    }

    public void eliminarCurso(Long id) {
        Curso curso = cursoRepo.getReferenceById(id);
        curso.setStatus(false);
    }
}

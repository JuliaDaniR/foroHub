package com.aluracursos.forohub.service;

import com.aluracursos.forohub.DTO.DatosRegistroCurso;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.repository.ICursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CursoService {
    
    @Autowired
    private ICursoRepository cursoRepo;
    
    public Curso registrarCurso(DatosRegistroCurso datosRegistroCurso){
        Curso curso = new Curso(datosRegistroCurso);
        
        return cursoRepo.save(curso);
    }   
}

package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.DTO.DatosRegistroCurso;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.service.CursoService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/curso")
public class CursoController {
    
    @Autowired
    private CursoService cursoService;
    
    
    @PostMapping
    public ResponseEntity registrarCurso(@RequestBody @Valid DatosRegistroCurso datosRegistroCurso, UriComponentsBuilder uriComponentsBuilder){
        System.out.println(datosRegistroCurso.subcategoria());
        Curso curso = cursoService.registrarCurso(datosRegistroCurso);
        System.out.println(curso.getSubcategoria());
        DatosRegistroCurso datosRespuesta = new DatosRegistroCurso(
                curso.getNombre(), 
                curso.getCategoriaPrincipal(),
                curso.getSubcategoria());
        
        URI url = uriComponentsBuilder.path("/curso/{id}").buildAndExpand(curso.getId()).toUri();
    
    return ResponseEntity.created(url).body(datosRegistroCurso);
    }
    
}
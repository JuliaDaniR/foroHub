package com.aluracursos.forohub.controller;

import com.aluracursos.forohub.DTO.DatosListadoCurso;
import com.aluracursos.forohub.DTO.DatosRegistroCurso;
import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.repository.ICursoRepository;
import com.aluracursos.forohub.service.CursoService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/curso")
@SecurityRequirement(name = "bearer-key")
public class CursoController {

    @Autowired
    private CursoService cursoService;

    @Autowired
    private ICursoRepository cursoRepo;

    @PostMapping("/registrar")
    public ResponseEntity registrarCurso(@RequestBody @Valid DatosRegistroCurso datosRegistroCurso, UriComponentsBuilder uriComponentsBuilder) {
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

    @GetMapping("/listar")
    public ResponseEntity<Page<DatosListadoCurso>> listarCursos(
            @PageableDefault(size = 10, sort = "nombre", direction = Sort.Direction.ASC) Pageable paginacion) {

        Page<Curso> curso = cursoRepo.findByStatusTrue(paginacion);
        Page<DatosListadoCurso> datosListadoCurso = curso.map(DatosListadoCurso::new);
        return ResponseEntity.ok().body(datosListadoCurso);
    }
}

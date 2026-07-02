package com.aluracursos.forohub.dto;

import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Curso;

public record DatosListadoCurso(
        Long id,
        String nombre,
        Categoria categoriaPrincipal,
        String subcategoria,
        String descripcion,
        String tags) {

    public DatosListadoCurso(Curso curso) {
        this(
                curso.getId(),
                curso.getNombre(),
                curso.getCategoriaPrincipal(),
                curso.getSubcategoria(),
                curso.getDescripcion(),
                curso.getTags()
        );
    }
}

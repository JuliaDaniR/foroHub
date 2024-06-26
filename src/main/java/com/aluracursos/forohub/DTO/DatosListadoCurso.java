package com.aluracursos.forohub.DTO;

import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Curso;

public record DatosListadoCurso(
        String nombre,
        Categoria categoriaPrincipal,
        String subcategoria) {

    public DatosListadoCurso(Curso curso) {
        this(
                curso.getNombre(),
                curso.getCategoriaPrincipal(),
                curso.getSubcategoria()
        );
    }
}

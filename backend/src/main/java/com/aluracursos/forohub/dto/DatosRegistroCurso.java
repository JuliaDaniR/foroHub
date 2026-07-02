package com.aluracursos.forohub.dto;

import com.aluracursos.forohub.enumerador.Categoria;
import jakarta.validation.constraints.NotBlank;

public record DatosRegistroCurso(
        Long id,
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        Categoria categoriaPrincipal,
        String subcategoria,
        String descripcion,
        String tags
        ) {
}

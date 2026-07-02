package com.aluracursos.forohub.dto;

import com.aluracursos.forohub.enumerador.Categoria;
import jakarta.validation.constraints.NotNull;

public record DatosActualizarCurso(
        @NotNull(message = "El id es obligatorio") Long id,
        String nombre,
        Categoria categoriaPrincipal,
        String subcategoria,
        String descripcion,
        String tags
) {}

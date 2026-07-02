package com.aluracursos.forohub.dto;

import com.aluracursos.forohub.enumerador.TipoPerfil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DatosRespuestaUsuario(
        Long id,
        @NotBlank
        String nombre,
        @NotBlank
        String email,
        @NotNull
        TipoPerfil perfil) {


}

package com.aluracursos.forohub.DTO;

import com.aluracursos.forohub.enumerador.TipoPerfil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DatosRespuestaRespuestas(
        @NotNull Long id,
        @NotBlank String mensaje,
        @NotNull LocalDateTime fechaCreacion,
        Boolean solucion,
        @NotBlank String nombreAutor,
        @NotNull TipoPerfil perfilAutor,
        @NotNull String tituloTopico) {

}

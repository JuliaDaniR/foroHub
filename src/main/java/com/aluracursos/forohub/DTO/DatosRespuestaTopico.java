package com.aluracursos.forohub.DTO;

import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.model.Respuesta;
import com.aluracursos.forohub.model.Usuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record DatosRespuestaTopico(
        @NotNull Long id,
        @NotBlank String titulo,
        @NotBlank String mensaje,
        @NotNull LocalDateTime fechaCreacion,
        @NotNull Usuario autor,
        @NotNull Curso curso,
        @NotNull List<Respuesta> respuestas) {

}

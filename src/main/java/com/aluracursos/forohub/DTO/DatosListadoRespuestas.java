package com.aluracursos.forohub.DTO;

import com.aluracursos.forohub.enumerador.TipoPerfil;
import com.aluracursos.forohub.model.Topico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DatosListadoRespuestas(
        @NotBlank String mensaje,
        @NotNull LocalDateTime fechaCreacion,
        @NotNull TipoPerfil autor,
        @NotNull Topico topico) {

}

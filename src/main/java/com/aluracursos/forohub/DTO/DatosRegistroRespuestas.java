package com.aluracursos.forohub.DTO;

import com.aluracursos.forohub.model.Topico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DatosRegistroRespuestas(
        @NotBlank
        String mensaje,
        @NotNull
        Long autorId,
        @NotNull
        Long topicoId) {

    public static record DatosActualizarRespuestas(
            @NotNull
            Long id,
            String mensaje,
            Boolean solucion,
            Topico topico) {

    }
}

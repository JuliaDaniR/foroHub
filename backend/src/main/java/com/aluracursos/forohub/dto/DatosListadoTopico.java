package com.aluracursos.forohub.dto;

import com.aluracursos.forohub.model.Topico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DatosListadoTopico(
        Long id,
        @NotBlank
        String titulo,
        @NotBlank
        String mensaje,
        @NotNull
        LocalDateTime fechaCreacion,
        @NotNull
        Boolean status,
        @NotNull
        String autor,
        @NotNull
        String curso,
        Boolean estaSolucionado) {

    public DatosListadoTopico(Topico topico) {
        this(topico.getId(),
                topico.getTitulo(),
            topico.getMensaje(),
        topico.getFechaCreacion(),
             topico.getStatus(),
              topico.getAutor().getNombre(),
              topico.getCurso().getNombre(),
              topico.getEstaSolucionado());
    }
}


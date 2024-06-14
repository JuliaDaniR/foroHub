package com.aluracursos.forohub.DTO;

import com.aluracursos.forohub.model.Curso;
import com.aluracursos.forohub.model.Topico;
import com.aluracursos.forohub.model.Usuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DatosListadoTopico(
        @NotBlank
        String titulo,
        @NotBlank
        String mensaje,
        @NotNull
        LocalDateTime fechaCreacion,
        @NotNull
        Boolean status,
        @NotNull
        Usuario autor,
        @NotNull
        Curso curso) {

    public DatosListadoTopico(Topico topico) {
        this(topico.getTitulo(),
            topico.getMensaje(),
        topico.getFechaCreacion(),
             topico.getStatus(),
              topico.getAutor(),
              topico.getCurso());
    }
}


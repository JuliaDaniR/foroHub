package com.aluracursos.forohub.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DatosRegistroTopico(
        @NotBlank(message = "El titulo es obligatorio") String titulo,
        @NotBlank(message = "Debe contener un mensaje") String mensaje,
        Long autorId,
        @NotNull Long cursoId
        ) {

    public void setAutorId(Long idAutor) {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }

    public static record DatosActualizarTopico(
            @NotNull Long id,
            String titulo,
            String mensaje,
            Long cursoId){
        
    }
}

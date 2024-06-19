package com.aluracursos.forohub.model;

import com.aluracursos.forohub.DTO.DatosRegistroRespuestas;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "Respuesta")
@Table(name = "respuestas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Respuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String mensaje;

    private LocalDateTime fechaCreacion;

    private Boolean status;

    private Boolean solucion = false;

    @ManyToOne(fetch = FetchType.LAZY)
    private Usuario autor;

    @ManyToOne(fetch = FetchType.LAZY)
    private Topico topico;

    public Respuesta(DatosRegistroRespuestas respuestaDTO, Usuario autor, Topico topico) {
        this.mensaje = respuestaDTO.mensaje();
        this.fechaCreacion = LocalDateTime.now();
        this.solucion = false;
        this.autor = autor;
        this.topico = topico;
        this.status = true;
    }

    public void actualizarDatos(DatosRegistroRespuestas.DatosActualizarRespuestas datosActualizarRespuestas) {
        if (datosActualizarRespuestas.mensaje() != null) {
            this.mensaje = datosActualizarRespuestas.mensaje();
        }
        if (datosActualizarRespuestas.solucion() != null) {
            this.solucion = datosActualizarRespuestas.solucion();
        }
        if (datosActualizarRespuestas.topico() != null) {
            this.topico = datosActualizarRespuestas.topico();
        }
    }

    public void darRespuestaComoSolucion() {
        this.solucion = true;
    }

    public void desactivarRespuesta() {
        this.status = false;
    }

    public void desmarcarRespuestaComoSolucion() {
        this.solucion = false;
    }

}

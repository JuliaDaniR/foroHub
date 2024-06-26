package com.aluracursos.forohub.model;

import com.aluracursos.forohub.DTO.DatosRegistroTopico;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "Topico")
@Table(name = "topicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Topico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @JsonIgnore
    private Long id;

    private String titulo;
    private String mensaje;

    private LocalDateTime fechaCreacion;
    private Boolean status;
    private Boolean estaSolucionado;

    @ManyToOne(fetch = FetchType.EAGER)
    private Usuario autor;

    @ManyToOne(fetch = FetchType.EAGER)
    private Curso curso;

    @OneToMany(mappedBy = "topico")
    private List<Respuesta> respuestas;

    public Topico(DatosRegistroTopico topicoDTO, Usuario autor, Curso curso) {
        this.titulo = topicoDTO.titulo();
        this.mensaje = topicoDTO.mensaje();
        this.fechaCreacion = LocalDateTime.now();
        this.autor = autor;
        this.curso = curso;
        this.status = true;
        this.estaSolucionado = false;
    }

    public void actualizarDatos(DatosRegistroTopico.DatosActualizarTopico datosActualizarTopico) {
        if (datosActualizarTopico.titulo() != null) {
            this.titulo = datosActualizarTopico.titulo();
        }
        if (datosActualizarTopico.mensaje() != null) {
            this.mensaje = datosActualizarTopico.mensaje();
        }
    }

    public void desactivarTopico() {
        this.status = false;
    }

    public void activarTopico() {
        this.status = true;
    }
    
    
}

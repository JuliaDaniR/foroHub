package com.aluracursos.forohub.model;

import com.aluracursos.forohub.DTO.DatosRegistroCurso;
import com.aluracursos.forohub.enumerador.Categoria;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "Curso")
@Table(name = "cursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Curso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @JsonIgnore
    private Long id;
    
    private String nombre;
    
    @Enumerated(EnumType.STRING)
    private Categoria categoriaPrincipal;

    private String subcategoria;

    @OneToMany(mappedBy = "curso")
    @JsonIgnore
    private List<Topico> topicos;
    
    public Curso(DatosRegistroCurso registroCurso){
        this.nombre = registroCurso.nombre();
        this.categoriaPrincipal = registroCurso.categoriaPrincipal();
        this.subcategoria = registroCurso.subcategoria();
    }
}

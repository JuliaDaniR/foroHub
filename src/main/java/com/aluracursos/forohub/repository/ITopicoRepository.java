package com.aluracursos.forohub.repository;

import com.aluracursos.forohub.enumerador.Categoria;
import com.aluracursos.forohub.model.Topico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ITopicoRepository extends JpaRepository<Topico, Long> {

    Page<Topico> findByStatusTrue(Pageable paginacion);

    @Query("SELECT t FROM Topico t WHERE t.curso.categoriaPrincipal = :categoriaPrincipal AND YEAR(t.fechaCreacion) = :anio")
    Page<Topico> findByCursoCategoriaPrincipalAndAnio(@Param("categoriaPrincipal") Categoria categoriaPrincipal, @Param("anio") int anio, Pageable pageable);

    public Page<Topico> findByFechaCreacionYear(int anio, Pageable pageable);

}

package com.aluracursos.forohub.repository;

import com.aluracursos.forohub.model.Respuesta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IRespuestaRepository extends JpaRepository<Respuesta, Long>{

    public Page<Respuesta> findByStatusTrue(Pageable paginacion);

     Page<Respuesta> findByTopicoId(Long topicoId, Pageable pageable);

    
}

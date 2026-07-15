package com.uteq.traileresbackend.repository;

import com.uteq.traileresbackend.model.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RutaRepository extends JpaRepository<Ruta, Integer> {

    boolean existsByIdConductorAndEstado(Integer idConductor, String estado);

    boolean existsByIdTrailerAndEstado(Integer idTrailer, String estado);

    List<Ruta> findByEstado(String estado);
}
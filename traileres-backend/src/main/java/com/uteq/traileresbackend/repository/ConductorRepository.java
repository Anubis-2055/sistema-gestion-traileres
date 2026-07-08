package com.uteq.traileresbackend.repository;

import com.uteq.traileresbackend.model.Conductor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConductorRepository extends JpaRepository<Conductor, Integer> {

    Optional<Conductor> findByCedula(String cedula);

    boolean existsByCedula(String cedula);
}
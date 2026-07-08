package com.uteq.traileresbackend.repository;

import com.uteq.traileresbackend.model.Trailer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TrailerRepository extends JpaRepository<Trailer, Integer> {

    Optional<Trailer> findByPlaca(String placa);

    boolean existsByPlaca(String placa);
}
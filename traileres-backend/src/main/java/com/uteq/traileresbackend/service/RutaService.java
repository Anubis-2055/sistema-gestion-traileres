package com.uteq.traileresbackend.service;

import com.uteq.traileresbackend.model.Ruta;
import com.uteq.traileresbackend.repository.RutaRepository;
import com.uteq.traileresbackend.repository.TrailerRepository;
import com.uteq.traileresbackend.repository.ConductorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RutaService {

    private final RutaRepository rutaRepository;
    private final TrailerRepository trailerRepository;
    private final ConductorRepository conductorRepository;

    public List<Ruta> listarTodas() {
        return rutaRepository.findAll();
    }

    public Ruta buscarPorId(Integer id) {
        return rutaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La ruta seleccionada no existe"));
    }

    public Ruta crear(Ruta ruta) {
        // TC-RUT-01: no existe disponibilidad de trailer o conductor
        var trailer = trailerRepository.findById(ruta.getIdTrailer())
                .orElseThrow(() -> new RuntimeException("No es posible registrar la ruta porque no hay un trailer o conductor disponible"));
        var conductor = conductorRepository.findById(ruta.getIdConductor())
                .orElseThrow(() -> new RuntimeException("No es posible registrar la ruta porque no hay un trailer o conductor disponible"));

        if (!"DISPONIBLE".equals(trailer.getEstado())) {
            throw new RuntimeException("No es posible registrar la ruta porque no hay un trailer o conductor disponible");
        }
        if (!"DISPONIBLE".equals(conductor.getEstado())) {
            throw new RuntimeException("No es posible registrar la ruta porque no hay un trailer o conductor disponible");
        }

        // TC-RUT-02: conductor ya asignado a otra ruta activa
        if (rutaRepository.existsByIdConductorAndEstado(ruta.getIdConductor(), "ACTIVA")) {
            throw new RuntimeException("No es posible asignar el conductor porque no se encuentra disponible");
        }

        // TC-RUT-03: trailer ya asignado a otra ruta activa
        if (rutaRepository.existsByIdTrailerAndEstado(ruta.getIdTrailer(), "ACTIVA")) {
            throw new RuntimeException("El trailer seleccionado ya se encuentra asignado a otra ruta activa");
        }

        ruta.setFechaInicio(LocalDateTime.now());
        ruta.setEstado("ACTIVA");
        Ruta guardada = rutaRepository.save(ruta);

        // Marcamos trailer y conductor como ASIGNADO
        trailer.setEstado("ASIGNADO");
        trailerRepository.save(trailer);
        conductor.setEstado("ASIGNADO");
        conductorRepository.save(conductor);

        return guardada;
    }

    public Ruta finalizar(Integer id) {
        Ruta ruta = buscarPorId(id);

        // TC-RUT-04: no finalizar una ruta que no esta activa
        if (!"ACTIVA".equals(ruta.getEstado())) {
            throw new RuntimeException("No es posible finalizar la ruta porque no se encuentra activa");
        }

        ruta.setEstado("FINALIZADA");
        ruta.setFechaFin(LocalDateTime.now());
        Ruta actualizada = rutaRepository.save(ruta);

        // Liberamos trailer y conductor
        trailerRepository.findById(ruta.getIdTrailer()).ifPresent(t -> {
            t.setEstado("DISPONIBLE");
            trailerRepository.save(t);
        });
        conductorRepository.findById(ruta.getIdConductor()).ifPresent(c -> {
            c.setEstado("DISPONIBLE");
            conductorRepository.save(c);
        });

        return actualizada;
    }

    public Ruta cancelar(Integer id) {
        Ruta ruta = buscarPorId(id);

        if (!"ACTIVA".equals(ruta.getEstado())) {
            throw new RuntimeException("No es posible cancelar la ruta porque no se encuentra activa");
        }

        ruta.setEstado("CANCELADA");
        ruta.setFechaFin(LocalDateTime.now());
        Ruta actualizada = rutaRepository.save(ruta);

        trailerRepository.findById(ruta.getIdTrailer()).ifPresent(t -> {
            t.setEstado("DISPONIBLE");
            trailerRepository.save(t);
        });
        conductorRepository.findById(ruta.getIdConductor()).ifPresent(c -> {
            c.setEstado("DISPONIBLE");
            conductorRepository.save(c);
        });

        return actualizada;
    }
}
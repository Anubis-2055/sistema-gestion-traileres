package com.uteq.traileresbackend.service;

import com.uteq.traileresbackend.model.Trailer;
import com.uteq.traileresbackend.repository.TrailerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrailerService {

    private final TrailerRepository trailerRepository;

    public List<Trailer> listarTodos() {
        return trailerRepository.findAll();
    }

    public Trailer buscarPorId(Integer id) {
        return trailerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El trailer seleccionado no existe"));
    }

    public Trailer crear(Trailer trailer) {
        if (trailerRepository.existsByPlaca(trailer.getPlaca())) {
            throw new RuntimeException("Ya existe un trailer registrado con esa placa");
        }
        trailer.setFechaRegistro(LocalDateTime.now());
        if (trailer.getEstado() == null || trailer.getEstado().isBlank()) {
            trailer.setEstado("DISPONIBLE");
        }
        return trailerRepository.save(trailer);
    }

    public Trailer actualizar(Integer id, Trailer datos) {
        Trailer existente = buscarPorId(id);
        existente.setMarca(datos.getMarca());
        existente.setModelo(datos.getModelo());
        existente.setCapacidad(datos.getCapacidad());
        existente.setToneladas(datos.getToneladas());
        existente.setEstado(datos.getEstado());
        return trailerRepository.save(existente);
    }

    public void eliminar(Integer id) {
        Trailer trailer = buscarPorId(id);
        try {
            trailerRepository.delete(trailer);
            trailerRepository.flush(); // fuerza el DELETE ya, para atrapar el error del trigger aqui mismo
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("No se puede eliminar un trailer con rutas activas");
        }
    }
}
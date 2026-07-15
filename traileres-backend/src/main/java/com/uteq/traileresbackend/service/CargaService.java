package com.uteq.traileresbackend.service;

import com.uteq.traileresbackend.model.Carga;
import com.uteq.traileresbackend.model.Ruta;
import com.uteq.traileresbackend.model.Trailer;
import com.uteq.traileresbackend.repository.CargaRepository;
import com.uteq.traileresbackend.repository.RutaRepository;
import com.uteq.traileresbackend.repository.TrailerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CargaService {

    private final CargaRepository cargaRepository;
    private final RutaRepository rutaRepository;
    private final TrailerRepository trailerRepository;

    public List<Carga> listarTodas() {
        return cargaRepository.findAll();
    }

    public Carga buscarPorId(Integer id) {
        // TC-CAR-02: carga no existe
        return cargaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La carga seleccionada no existe"));
    }

    public Carga crear(Carga carga) {
        Ruta ruta = rutaRepository.findById(carga.getIdRuta())
                .orElseThrow(() -> new RuntimeException("La ruta seleccionada no existe"));

        Trailer trailer = trailerRepository.findById(ruta.getIdTrailer())
                .orElseThrow(() -> new RuntimeException("El trailer asignado a esta ruta no existe"));

        // TC-CAR-01: peso supera la capacidad del trailer
        if (carga.getPeso().compareTo(trailer.getCapacidad()) > 0) {
            throw new RuntimeException("El peso de la carga supera la capacidad del trailer");
        }

        if (carga.getEstado() == null || carga.getEstado().isBlank()) {
            carga.setEstado("REGISTRADA");
        }

        return cargaRepository.save(carga);
    }

    public Carga actualizarEstado(Integer id, String nuevoEstado) {
        Carga carga = buscarPorId(id);
        carga.setEstado(nuevoEstado);
        return cargaRepository.save(carga);
    }

    public void eliminar(Integer id) {
        Carga carga = buscarPorId(id);

        // TC-CAR-03: no eliminar carga en transito
        if ("EN_TRANSITO".equals(carga.getEstado())) {
            throw new RuntimeException("No se puede eliminar una carga que está en tránsito");
        }

        try {
            cargaRepository.delete(carga);
            cargaRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("No se puede eliminar esta carga");
        }
    }
}
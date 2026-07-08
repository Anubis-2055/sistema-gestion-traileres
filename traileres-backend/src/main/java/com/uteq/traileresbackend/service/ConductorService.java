package com.uteq.traileresbackend.service;

import com.uteq.traileresbackend.model.Conductor;
import com.uteq.traileresbackend.repository.ConductorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConductorService {

    private final ConductorRepository conductorRepository;

    public List<Conductor> listarTodos() {
        return conductorRepository.findAll();
    }

    public Conductor buscarPorId(Integer id) {
        return conductorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El conductor seleccionado no existe"));
    }

    public Conductor crear(Conductor conductor) {
        // TC-CON-01: cedula duplicada
        if (conductorRepository.existsByCedula(conductor.getCedula())) {
            throw new RuntimeException("La cédula ya está registrada");
        }
        conductor.setFechaRegistro(LocalDateTime.now());
        if (conductor.getEstado() == null || conductor.getEstado().isBlank()) {
            conductor.setEstado("DISPONIBLE");
        }
        return conductorRepository.save(conductor);
    }

    public Conductor actualizar(Integer id, Conductor datos) {
        Conductor existente = buscarPorId(id);
        existente.setNombres(datos.getNombres());
        existente.setApellidos(datos.getApellidos());
        existente.setLicencia(datos.getLicencia());
        existente.setTelefono(datos.getTelefono());
        existente.setEstado(datos.getEstado());
        return conductorRepository.save(existente);
    }

    public void eliminar(Integer id) {
        // TC-CON-03: no eliminar conductor con rutas activas (lo bloquea el trigger de la BD)
        Conductor conductor = buscarPorId(id);
        try {
            conductorRepository.delete(conductor);
            conductorRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("No se puede eliminar el conductor porque tiene rutas asignadas");
        }
    }
}
package com.uteq.traileresbackend.controller;

import com.uteq.traileresbackend.repository.TrailerRepository;
import com.uteq.traileresbackend.repository.ConductorRepository;
import com.uteq.traileresbackend.repository.RutaRepository;
import com.uteq.traileresbackend.repository.CargaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteController {

    private final TrailerRepository trailerRepository;
    private final ConductorRepository conductorRepository;
    private final RutaRepository rutaRepository;
    private final CargaRepository cargaRepository;

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> resumen() {
        Map<String, Object> resumen = new HashMap<>();

        resumen.put("totalTraileres", trailerRepository.count());
        resumen.put("traileresDisponibles", trailerRepository.findAll().stream()
                .filter(t -> "DISPONIBLE".equals(t.getEstado())).count());

        resumen.put("totalConductores", conductorRepository.count());
        resumen.put("conductoresDisponibles", conductorRepository.findAll().stream()
                .filter(c -> "DISPONIBLE".equals(c.getEstado())).count());

        resumen.put("rutasActivas", rutaRepository.findByEstado("ACTIVA").size());
        resumen.put("rutasFinalizadas", rutaRepository.findByEstado("FINALIZADA").size());
        resumen.put("rutasCanceladas", rutaRepository.findByEstado("CANCELADA").size());

        resumen.put("totalCargas", cargaRepository.count());

        return ResponseEntity.ok(resumen);
    }
}
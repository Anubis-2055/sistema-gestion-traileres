package com.uteq.traileresbackend.controller;

import com.uteq.traileresbackend.model.Conductor;
import com.uteq.traileresbackend.service.ConductorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conductores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConductorController {

    private final ConductorService conductorService;

    @GetMapping
    public ResponseEntity<List<Conductor>> listar() {
        return ResponseEntity.ok(conductorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(conductorService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Conductor conductor) {
        try {
            return ResponseEntity.ok(conductorService.crear(conductor));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @Valid @RequestBody Conductor conductor) {
        try {
            return ResponseEntity.ok(conductorService.actualizar(id, conductor));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            conductorService.eliminar(id);
            return ResponseEntity.ok("Conductor eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
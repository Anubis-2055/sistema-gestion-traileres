package com.uteq.traileresbackend.controller;

import com.uteq.traileresbackend.model.Trailer;
import com.uteq.traileresbackend.service.TrailerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traileres")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrailerController {

    private final TrailerService trailerService;

    @GetMapping
    public ResponseEntity<List<Trailer>> listar() {
        return ResponseEntity.ok(trailerService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(trailerService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Trailer trailer) {
        try {
            return ResponseEntity.ok(trailerService.crear(trailer));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @Valid @RequestBody Trailer trailer) {
        try {
            return ResponseEntity.ok(trailerService.actualizar(id, trailer));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            trailerService.eliminar(id);
            return ResponseEntity.ok("Trailer eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
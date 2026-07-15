package com.uteq.traileresbackend.controller;

import com.uteq.traileresbackend.model.Ruta;
import com.uteq.traileresbackend.service.RutaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rutas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RutaController {

    private final RutaService rutaService;

    @GetMapping
    public ResponseEntity<List<Ruta>> listar() {
        return ResponseEntity.ok(rutaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(rutaService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Ruta ruta) {
        try {
            return ResponseEntity.ok(rutaService.crear(ruta));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(rutaService.finalizar(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(rutaService.cancelar(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
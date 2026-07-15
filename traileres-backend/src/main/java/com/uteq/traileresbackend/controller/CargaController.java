package com.uteq.traileresbackend.controller;

import com.uteq.traileresbackend.model.Carga;
import com.uteq.traileresbackend.service.CargaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cargas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CargaController {

    private final CargaService cargaService;

    @GetMapping
    public ResponseEntity<List<Carga>> listar() {
        return ResponseEntity.ok(cargaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(cargaService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Carga carga) {
        try {
            return ResponseEntity.ok(cargaService.crear(carga));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(cargaService.actualizarEstado(id, body.get("estado")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            cargaService.eliminar(id);
            return ResponseEntity.ok("Carga eliminada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
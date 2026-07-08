package com.uteq.traileresbackend.controller;

import com.uteq.traileresbackend.dto.LoginRequest;
import com.uteq.traileresbackend.dto.LoginResponse;
import com.uteq.traileresbackend.security.JwtUtil;
import com.uteq.traileresbackend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // permite que tu HTML (aunque este en otro origen) llame al backend
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getUsername(), request.getPassword());
            String rol = jwtUtil.extractRol(token);

            return ResponseEntity.ok(new LoginResponse(token, request.getUsername(), rol));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
    @GetMapping("/generar-hash/{password}")
    public String generarHash(@PathVariable String password) {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(password);
    }
}
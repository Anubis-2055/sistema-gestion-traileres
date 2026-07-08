package com.uteq.traileresbackend.service;

import com.uteq.traileresbackend.model.Usuario;
import com.uteq.traileresbackend.repository.UsuarioRepository;
import com.uteq.traileresbackend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String login(String username, String password) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }

        if (!"ACTIVO".equals(usuario.getEstado())) {
            throw new RuntimeException("Usuario inactivo, contacte al administrador");
        }

        return jwtUtil.generateToken(usuario.getUsername(), usuario.getRol());
    }
}
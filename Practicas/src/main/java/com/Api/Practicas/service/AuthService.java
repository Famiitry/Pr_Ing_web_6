package com.Api.Practicas.service;

import com.Api.Practicas.dto.AuthResponse;
import com.Api.Practicas.dto.LoginRequest;
import com.Api.Practicas.dto.RegisterRequest;
import com.Api.Practicas.model.Role;
import com.Api.Practicas.model.User;
import com.Api.Practicas.repository.UserRepository;
import com.Api.Practicas.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo electrónico ya está registrado");
        }

        Role assignedRole = (request.getRole() != null) ? request.getRole() : Role.CLIENTE;

        User user = new User(
                request.getNombre(),
                request.getApellido(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getTelefono(),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", savedUser.getRole().name());
        extraClaims.put("nombre", savedUser.getNombre());

        String jwtToken = jwtService.generateToken(extraClaims, savedUser);

        return new AuthResponse(
                jwtToken,
                savedUser.getId(),
                savedUser.getNombre(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("nombre", user.getNombre());

        String jwtToken = jwtService.generateToken(extraClaims, user);

        return new AuthResponse(
                jwtToken,
                user.getId(),
                user.getNombre(),
                user.getEmail(),
                user.getRole()
        );
    }
}


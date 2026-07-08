package com.uteq.traileresbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "conductores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conductor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conductor")
    private Integer idConductor;

    @NotBlank(message = "La cédula es obligatoria")
    @Column(unique = true, nullable = false, length = 10)
    private String cedula;

    @NotBlank(message = "Los nombres son obligatorios")
    @Column(nullable = false, length = 100)
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Column(nullable = false, length = 100)
    private String apellidos;

    @NotBlank(message = "La licencia es obligatoria")
    @Column(nullable = false, length = 20)
    private String licencia;

    @Column(length = 15)
    private String telefono;

    @Column(nullable = false, length = 20)
    private String estado = "DISPONIBLE";

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
}
package com.uteq.traileresbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "traileres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trailer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_trailer")
    private Integer idTrailer;

    @NotBlank(message = "La placa es obligatoria")
    @Column(unique = true, nullable = false, length = 10)
    private String placa;

    @NotBlank(message = "La marca es obligatoria")
    @Column(nullable = false, length = 50)
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    @Column(nullable = false, length = 50)
    private String modelo;

    @NotNull(message = "La capacidad es obligatoria")
    @Positive(message = "La capacidad debe ser mayor a cero")
    @Column(nullable = false)
    private BigDecimal capacidad;

    private BigDecimal toneladas;

    @Column(nullable = false, length = 20)
    private String estado = "DISPONIBLE";

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
}
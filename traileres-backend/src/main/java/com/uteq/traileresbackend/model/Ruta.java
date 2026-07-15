package com.uteq.traileresbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "rutas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ruta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ruta")
    private Integer idRuta;

    @NotNull(message = "Debe seleccionar un trailer")
    @Column(name = "id_trailer", nullable = false)
    private Integer idTrailer;

    @NotNull(message = "Debe seleccionar un conductor")
    @Column(name = "id_conductor", nullable = false)
    private Integer idConductor;

    @NotBlank(message = "El origen es obligatorio")
    @Column(nullable = false, length = 100)
    private String origen;

    @NotBlank(message = "El destino es obligatorio")
    @Column(nullable = false, length = 100)
    private String destino;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(nullable = false, length = 20)
    private String estado = "ACTIVA";
}
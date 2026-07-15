package com.uteq.traileresbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "cargas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Carga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carga")
    private Integer idCarga;

    @NotNull(message = "Debe seleccionar una ruta")
    @Column(name = "id_ruta", nullable = false)
    private Integer idRuta;

    @Column(length = 150)
    private String descripcion;

    @NotNull(message = "El peso es obligatorio")
    @Positive(message = "El peso debe ser mayor a cero")
    @Column(nullable = false)
    private BigDecimal peso;

    @Column(nullable = false, length = 20)
    private String estado = "REGISTRADA";
}
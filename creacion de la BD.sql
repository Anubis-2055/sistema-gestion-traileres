-- ============================================================
-- 1. USUARIOS (módulo de login)
-- ============================================================
CREATE TABLE usuarios (
    id_usuario      SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(30) NOT NULL CHECK (rol IN ('ADMIN','SUPERVISOR','CONDUCTOR')),
    estado          VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','INACTIVO')),
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW()
);
 
-- ============================================================
-- 2. CONDUCTORES
-- ============================================================
CREATE TABLE conductores (
    id_conductor    SERIAL PRIMARY KEY,
    cedula          VARCHAR(10) UNIQUE NOT NULL,
    nombres         VARCHAR(100) NOT NULL,
    apellidos       VARCHAR(100) NOT NULL,
    licencia        VARCHAR(20) NOT NULL,
    telefono        VARCHAR(15),
    estado          VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE'
                    CHECK (estado IN ('DISPONIBLE','ASIGNADO','INACTIVO')),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW()
);
 
-- ============================================================
-- 3. TRÁILERES
-- ============================================================
CREATE TABLE traileres (
    id_trailer      SERIAL PRIMARY KEY,
    placa           VARCHAR(10) UNIQUE NOT NULL,
    marca           VARCHAR(50) NOT NULL,
    modelo          VARCHAR(50) NOT NULL,
    capacidad       NUMERIC(10,2) NOT NULL CHECK (capacidad > 0),   -- toneladas máx que soporta
    toneladas       NUMERIC(10,2),                                   -- peso propio / referencia
    estado          VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE'
                    CHECK (estado IN ('DISPONIBLE','ASIGNADO','MANTENIMIENTO')),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW()
);
 
-- ============================================================
-- 4. RUTAS
-- ============================================================
CREATE TABLE rutas (
    id_ruta         SERIAL PRIMARY KEY,
    id_trailer      INT NOT NULL REFERENCES traileres(id_trailer),
    id_conductor    INT NOT NULL REFERENCES conductores(id_conductor),
    origen          VARCHAR(100) NOT NULL,
    destino         VARCHAR(100) NOT NULL,
    fecha_inicio    TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_fin       TIMESTAMP,
    estado          VARCHAR(20) NOT NULL DEFAULT 'ACTIVA'
                    CHECK (estado IN ('ACTIVA','FINALIZADA','CANCELADA'))
);
 
-- ============================================================
-- 5. CARGA
-- ============================================================
CREATE TABLE cargas (
    id_carga        SERIAL PRIMARY KEY,
    id_ruta         INT NOT NULL REFERENCES rutas(id_ruta),
    descripcion     VARCHAR(150),
    peso            NUMERIC(10,2) NOT NULL CHECK (peso > 0),  -- toneladas
    estado          VARCHAR(20) NOT NULL DEFAULT 'REGISTRADA'
                    CHECK (estado IN ('REGISTRADA','EN_TRANSITO','ENTREGADA'))
);
 
-- ============================================================
-- 6. SEGUIMIENTO DE CARGA (tracking)
-- ============================================================
CREATE TABLE seguimiento_carga (
    id_seguimiento  SERIAL PRIMARY KEY,
    id_carga        INT NOT NULL REFERENCES cargas(id_carga),
    estado          VARCHAR(20) NOT NULL
                    CHECK (estado IN ('REGISTRADA','EN_TRANSITO','ENTREGADA','RETRASADA')),
    ubicacion       VARCHAR(150),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW()
);
 
-- ============================================================
-- TRIGGERS: reglas de negocio de los casos de prueba (TC-*)
-- ============================================================
 
-- TC-CON-03 / TC-TRA-03: no eliminar conductor/tráiler con rutas activas
CREATE OR REPLACE FUNCTION fn_bloquear_eliminacion_con_ruta_activa()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'conductores' THEN
        IF EXISTS (SELECT 1 FROM rutas WHERE id_conductor = OLD.id_conductor AND estado = 'ACTIVA') THEN
            RAISE EXCEPTION 'No se puede eliminar el conductor porque tiene rutas asignadas';
        END IF;
    ELSIF TG_TABLE_NAME = 'traileres' THEN
        IF EXISTS (SELECT 1 FROM rutas WHERE id_trailer = OLD.id_trailer AND estado = 'ACTIVA') THEN
            RAISE EXCEPTION 'No se puede eliminar un trailer con rutas activas';
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_bloquear_delete_conductor
BEFORE DELETE ON conductores
FOR EACH ROW EXECUTE FUNCTION fn_bloquear_eliminacion_con_ruta_activa();
 
CREATE TRIGGER trg_bloquear_delete_trailer
BEFORE DELETE ON traileres
FOR EACH ROW EXECUTE FUNCTION fn_bloquear_eliminacion_con_ruta_activa();
 
-- TC-CAR-03: no eliminar carga en tránsito
CREATE OR REPLACE FUNCTION fn_bloquear_delete_carga_transito()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado = 'EN_TRANSITO' THEN
        RAISE EXCEPTION 'No se puede eliminar una carga que está en tránsito';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_bloquear_delete_carga
BEFORE DELETE ON cargas
FOR EACH ROW EXECUTE FUNCTION fn_bloquear_delete_carga_transito();
 
-- TC-CAR-01: el peso de la carga no puede superar la capacidad del tráiler asignado
CREATE OR REPLACE FUNCTION fn_validar_peso_vs_capacidad()
RETURNS TRIGGER AS $$
DECLARE
    v_capacidad NUMERIC(10,2);
BEGIN
    SELECT t.capacidad INTO v_capacidad
    FROM rutas r JOIN traileres t ON r.id_trailer = t.id_trailer
    WHERE r.id_ruta = NEW.id_ruta;
 
    IF NEW.peso > v_capacidad THEN
        RAISE EXCEPTION 'El peso de la carga supera la capacidad del trailer';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_validar_peso_carga
BEFORE INSERT OR UPDATE ON cargas
FOR EACH ROW EXECUTE FUNCTION fn_validar_peso_vs_capacidad();
 
-- TC-RUT-02 / TC-RUT-03: no asignar conductor/trailer ya ocupados en otra ruta activa
CREATE OR REPLACE FUNCTION fn_validar_disponibilidad_ruta()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM rutas
        WHERE id_conductor = NEW.id_conductor AND estado = 'ACTIVA' AND id_ruta <> COALESCE(NEW.id_ruta,-1)
    ) THEN
        RAISE EXCEPTION 'No es posible asignar el conductor porque no se encuentra disponible';
    END IF;
 
    IF EXISTS (
        SELECT 1 FROM rutas
        WHERE id_trailer = NEW.id_trailer AND estado = 'ACTIVA' AND id_ruta <> COALESCE(NEW.id_ruta,-1)
    ) THEN
        RAISE EXCEPTION 'El trailer seleccionado ya se encuentra asignado a otra ruta activa';
    END IF;
 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_validar_disponibilidad_ruta
BEFORE INSERT OR UPDATE ON rutas
FOR EACH ROW EXECUTE FUNCTION fn_validar_disponibilidad_ruta();
 
-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================
INSERT INTO usuarios (username, password_hash, rol) VALUES
('admin', '$2a$10$placeholderHashAdmin', 'ADMIN'),
('supervisor1', '$2a$10$placeholderHashSup', 'SUPERVISOR');
 
INSERT INTO conductores (cedula, nombres, apellidos, licencia, telefono) VALUES
('1204567890', 'Juan', 'Pérez', 'TIPO-E', '0991234567'),
('0912345678', 'María', 'Gómez', 'TIPO-E', '0987654321');
 
INSERT INTO traileres (placa, marca, modelo, capacidad, toneladas) VALUES
('ABC-1234', 'Volvo', 'FH16', 25.00, 8.5),
('XYZ-5678', 'Kenworth', 'T800', 20.00, 7.0);
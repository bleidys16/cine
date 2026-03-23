-- ============================================
-- SISTEMA WEB GESTIÓN DE CINE - SCHEMA SQL
-- Compatible con Neon PostgreSQL
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de películas
CREATE TABLE IF NOT EXISTS peliculas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    duracion INTEGER NOT NULL, -- en minutos
    genero VARCHAR(50),
    clasificacion VARCHAR(10),
    imagen_url TEXT,
    trailer_url TEXT,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva'))
);

-- Tabla de funciones
CREATE TABLE IF NOT EXISTS funciones (
    id SERIAL PRIMARY KEY,
    pelicula_id INTEGER REFERENCES peliculas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    sala VARCHAR(50) DEFAULT 'Sala 1',
    precio DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'cancelada'))
);

-- Tabla de asientos (150 sillas fijas)
CREATE TABLE IF NOT EXISTS asientos (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL,
    fila CHAR(1) NOT NULL,
    columna INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo'))
);

-- Tabla de tiquetes
CREATE TABLE IF NOT EXISTS tiquetes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    funcion_id INTEGER REFERENCES funciones(id) ON DELETE CASCADE,
    fecha_compra TIMESTAMP DEFAULT NOW(),
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'usado', 'cancelado'))
);

-- Tabla detalle de tiquetes (asientos por tiquete)
CREATE TABLE IF NOT EXISTS detalle_tiquete (
    id SERIAL PRIMARY KEY,
    tiquete_id INTEGER REFERENCES tiquetes(id) ON DELETE CASCADE,
    asiento_id INTEGER REFERENCES asientos(id),
    precio_unitario DECIMAL(10,2) NOT NULL,
    UNIQUE(tiquete_id, asiento_id)
);

-- Tabla para asientos ocupados por función (evita doble venta)
CREATE TABLE IF NOT EXISTS asientos_funcion (
    id SERIAL PRIMARY KEY,
    funcion_id INTEGER REFERENCES funciones(id) ON DELETE CASCADE,
    asiento_id INTEGER REFERENCES asientos(id),
    tiquete_id INTEGER REFERENCES tiquetes(id),
    UNIQUE(funcion_id, asiento_id)
);

-- ============================================
-- SEED: Insertar 150 asientos (filas A-J, 15 columnas)
-- ============================================
DO $$
DECLARE
    filas CHAR(1)[] := ARRAY['A','B','C','D','E','F','G','H','I','J'];
    f CHAR(1);
    c INTEGER;
    n INTEGER := 1;
BEGIN
    IF (SELECT COUNT(*) FROM asientos) = 0 THEN
        FOREACH f IN ARRAY filas LOOP
            FOR c IN 1..15 LOOP
                INSERT INTO asientos (numero, fila, columna) VALUES (n, f, c);
                n := n + 1;
            END LOOP;
        END LOOP;
    END IF;
END $$;

-- ============================================
-- SEED: Usuario admin por defecto
-- Password: admin123 (bcrypt hash)
-- ============================================
INSERT INTO usuarios (nombre, email, contrasena, rol)
VALUES ('Administrador', 'admin@cine.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SEED: Películas de ejemplo
-- ============================================
INSERT INTO peliculas (titulo, descripcion, duracion, genero, clasificacion, imagen_url) VALUES
('Dune: Parte Dos', 'Paul Atreides se une a los Fremen mientras persigue su venganza contra los conspiradores que destruyeron a su familia.', 166, 'Ciencia Ficción', '+13', 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg'),
('Oppenheimer', 'La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.', 180, 'Drama', '+13', 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'),
('Gladiador II', 'La continuación épica de la historia de la Roma antigua, llena de acción y traición.', 148, 'Acción', '+13', 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg'),
('Wicked', 'La historia jamás contada de las brujas de Oz, basada en el exitoso musical de Broadway.', 160, 'Musical', 'Para todos', 'https://image.tmdb.org/t/p/w500/c5XcBBLXWdVuCCzlC9cBJXFGrEU.jpg')
ON CONFLICT DO NOTHING;

-- Agregar estado preventa a funciones (ejecutar si ya existe la tabla)
-- ALTER TABLE funciones DROP CONSTRAINT IF EXISTS funciones_estado_check;
-- ALTER TABLE funciones ADD CONSTRAINT funciones_estado_check CHECK (estado IN ('disponible', 'cancelada', 'preventa'));

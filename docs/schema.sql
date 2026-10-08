CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- nunca guardar senha em texto puro (use bcrypt)
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE academias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    rua VARCHAR(255),
    numero VARCHAR(50),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    cep VARCHAR(10),
    capa_url VARCHAR(500),
    ativa BOOLEAN DEFAULT TRUE
);

CREATE TABLE planos_precos (
    id SERIAL PRIMARY KEY,
    academia_id INT REFERENCES academias(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('mensal', 'trimestral', 'anual')),
    valor DECIMAL(10,2) NOT NULL,
    beneficios TEXT,            -- itens separados por vírgula
    modalidades_cobertas TEXT,  -- itens separados por vírgula
    UNIQUE(academia_id, tipo)
);

CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    academia_id INT REFERENCES academias(id) ON DELETE CASCADE,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE midias_academia (
    id SERIAL PRIMARY KEY,
    academia_id INT REFERENCES academias(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    legenda VARCHAR(255)
);
-- ADR-002: URL relativa salva em /uploads/academias com UUID para otimizacao.

CREATE TABLE horarios_funcionamento (
    id SERIAL PRIMARY KEY,
    academia_id INT REFERENCES academias(id) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0 = domingo ... 6 = sábado
    hora_abre TIME,
    hora_fecha TIME,
    UNIQUE (academia_id, dia_semana) -- hora_abre/hora_fecha NULL = fechado nesse dia
);

CREATE TABLE modalidades (
    id SERIAL PRIMARY KEY,
    academia_id INT REFERENCES academias(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE infraestrutura (
    id SERIAL PRIMARY KEY,
    academia_id INT REFERENCES academias(id) ON DELETE CASCADE,
    item VARCHAR(100) NOT NULL
);

CREATE TABLE usuarios_favoritos (
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    academia_id INT REFERENCES academias(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, academia_id)
);

CREATE INDEX idx_academias_nome ON academias(nome);
CREATE INDEX idx_planos_academia ON planos_precos(academia_id);
CREATE INDEX idx_avaliacoes_academia ON avaliacoes(academia_id);
CREATE INDEX idx_midias_academia ON midias_academia(academia_id);
CREATE INDEX idx_horarios_academia ON horarios_funcionamento(academia_id);
CREATE INDEX idx_avaliacoes_data ON avaliacoes(data_avaliacao DESC);
CREATE TABLE IF NOT EXISTS rr_usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'restaurante') NOT NULL DEFAULT 'cliente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rr_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rr_restaurantes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NULL,
    nome VARCHAR(160) NOT NULL,
    cnpj VARCHAR(18) NULL,
    email VARCHAR(190) NULL,
    endereco VARCHAR(255) NOT NULL,
    localidade ENUM('Centro', 'Inocoop', 'Bairro dos 46', 'Bomba', 'Limoeiro', 'Orla de Camaçari') NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    tipo ENUM('Restaurante', 'Doceria', 'Bar', 'Cafeteria', 'Lanches rápidos') NOT NULL,
    preco_medio DECIMAL(8,2) NULL,
    ambientes JSON NULL,
    historia TEXT NULL,
    imagem LONGTEXT NULL,
    horario VARCHAR(100) NULL,
    especialidade VARCHAR(160) NULL,
    codigo_demo VARCHAR(60) NULL,
    status ENUM('pendente', 'ativo', 'suspenso') NOT NULL DEFAULT 'ativo',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rr_restaurantes_cnpj (cnpj),
    UNIQUE KEY uq_rr_restaurantes_codigo_demo (codigo_demo),
    KEY idx_rr_restaurantes_localidade_tipo (localidade, tipo),
    CONSTRAINT fk_rr_restaurantes_usuario FOREIGN KEY (usuario_id) REFERENCES rr_usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rr_destaques (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    plano ENUM('mais_visto', 'popular', 'basico') NOT NULL,
    posicao TINYINT UNSIGNED NOT NULL,
    valor_mensal DECIMAL(8,2) NOT NULL,
    inicio_em DATETIME NULL,
    fim_em DATETIME NULL,
    status ENUM('pendente', 'ativo', 'encerrado', 'cancelado') NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_rr_destaques_status_periodo (status, inicio_em, fim_em),
    CONSTRAINT fk_rr_destaques_restaurante FOREIGN KEY (restaurante_id) REFERENCES rr_restaurantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rr_pagamentos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    destaque_id BIGINT UNSIGNED NOT NULL,
    valor DECIMAL(8,2) NOT NULL,
    moeda CHAR(3) NOT NULL DEFAULT 'BRL',
    status ENUM('pendente', 'aprovado', 'recusado', 'estornado') NOT NULL DEFAULT 'pendente',
    provedor VARCHAR(80) NULL,
    referencia_provedor VARCHAR(190) NULL,
    pago_em DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rr_pagamentos_referencia (provedor, referencia_provedor),
    KEY idx_rr_pagamentos_status (status),
    CONSTRAINT fk_rr_pagamentos_destaque FOREIGN KEY (destaque_id) REFERENCES rr_destaques(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rr_comentarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL,
    texto TEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_rr_comentarios_restaurante (restaurante_id, criado_em),
    CONSTRAINT fk_rr_comentarios_restaurante FOREIGN KEY (restaurante_id) REFERENCES rr_restaurantes(id) ON DELETE CASCADE,
    CONSTRAINT fk_rr_comentarios_usuario FOREIGN KEY (usuario_id) REFERENCES rr_usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rr_curtidas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rr_curtidas_usuario_restaurante (usuario_id, restaurante_id),
    CONSTRAINT fk_rr_curtidas_restaurante FOREIGN KEY (restaurante_id) REFERENCES rr_restaurantes(id) ON DELETE CASCADE,
    CONSTRAINT fk_rr_curtidas_usuario FOREIGN KEY (usuario_id) REFERENCES rr_usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS rr_sessoes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expira_em DATETIME NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rr_sessoes_token_hash (token_hash),
    KEY idx_rr_sessoes_expira (expira_em),
    CONSTRAINT fk_rr_sessoes_usuario FOREIGN KEY (usuario_id) REFERENCES rr_usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO rr_restaurantes
    (codigo_demo, nome, endereco, localidade, telefone, tipo, preco_medio, ambientes, historia, horario, especialidade, status)
VALUES
    ('raizes-dende', 'Raízes de Dendê', 'Rua do Terreiro, 18', 'Centro', '(71) 3000-0001', 'Restaurante', 120, JSON_ARRAY('Aberto', 'Com música'), 'Pratos afro-baianos com tradição, sabor marcante e forte identidade cultural.', '12h às 22h', 'Culinária afro-baiana', 'ativo'),
    ('flor-mandacaru', 'Flor de Mandacaru', 'Rua da Pedra, 57', 'Inocoop', '(71) 3000-0002', 'Restaurante', 80, JSON_ARRAY('Aberto', 'Área kids'), 'Ambiente acolhedor e proposta regional contemporânea, valorizando ingredientes nordestinos.', '17h às 00h', 'Refeições contemporâneas', 'ativo'),
    ('canto-mare', 'Canto da Maré', 'Av. Beira-Mar, 205', 'Orla de Camaçari', '(71) 3000-0003', 'Restaurante', 170, JSON_ARRAY('Aberto'), 'Frutos do mar, moquecas e clima praiano à beira-mar.', '10h às 22h', 'Frutos do mar e praia', 'ativo'),
    ('tempero-cacau', 'Tempero do Cacau', 'Rua das Pedras, 12', 'Bairro dos 46', '(71) 3000-0004', 'Restaurante', 90, JSON_ARRAY('Aberto', 'Com música'), 'Culinária regional baiana, com temperos típicos e ingredientes locais.', '12h às 21h', 'Sabores baianos', 'ativo'),
    ('tacho-iaia', 'Tacho de Iaiá', 'Av. Central, 100', 'Centro', '(71) 3000-0005', 'Restaurante', 110, JSON_ARRAY('Aberto', 'Com música'), 'Receitas afro-baianas e sabores históricos que preservam a cultura do Recôncavo.', '11h às 23h', 'Cozinha regional', 'ativo'),
    ('quintal-orixas', 'Quintal dos Orixás', 'Praça das Flores, 44', 'Inocoop', '(71) 3000-0006', 'Restaurante', 140, JSON_ARRAY('Aberto', 'Área kids', 'Com música'), 'Culinária baiana contemporânea com ingredientes brasileiros e identidade cultural.', '18h às 00h', 'Petiscos e frutos do mar', 'ativo'),
    ('moqueca-lua', 'Moqueca da Lua', 'Travessa da Paz, 9', 'Orla de Camaçari', '(71) 3000-0007', 'Restaurante', 160, JSON_ARRAY('Aberto', 'Com música'), 'Moquecas e frutos do mar com tempero típico da Bahia.', '13h às 21h', 'Moquecas e peixes', 'ativo'),
    ('cafe-mandacaru', 'Café Mandacaru', 'Rua do Café, 72', 'Orla de Camaçari', '(71) 3000-0008', 'Cafeteria', 50, JSON_ARRAY('Aberto'), 'Café e cozinha regional em ambiente acolhedor.', '08h às 18h', 'Café e cozinha regional', 'ativo'),
    ('mare-serena', 'Maré Serena', 'Av. Beira-Mar, 210', 'Orla de Camaçari', '(71) 3000-0009', 'Restaurante', 180, JSON_ARRAY('Aberto'), 'Sabores locais à beira-mar, com clima leve e identidade baiana.', '09h às 23h', 'Cozinha costeira', 'ativo')
ON DUPLICATE KEY UPDATE codigo_demo = VALUES(codigo_demo);

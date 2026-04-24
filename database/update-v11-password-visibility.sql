-- Adiciona coluna de senha na tabela de usuários para visibilidade do admin
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

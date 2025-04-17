-- Migration pour ajouter la colonne user_id à la table seo_analyses
ALTER TABLE seo_analyses ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
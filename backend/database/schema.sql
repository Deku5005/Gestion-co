-- Suppression des tables dans l'ordre inverse des dépendances (avec CASCADE pour forcer)
DROP TABLE IF EXISTS mouvements_stock CASCADE;
DROP TABLE IF EXISTS inventaires CASCADE;
DROP TABLE IF EXISTS ventes CASCADE;
DROP TABLE IF EXISTS achats CASCADE;
DROP TABLE IF EXISTS depenses CASCADE;
DROP TABLE IF EXISTS fournisseurs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;

-- Création de la table Utilisateurs
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    statut VARCHAR(50) DEFAULT 'Actif'
);

-- Création de la table Articles
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    designation VARCHAR(255),
    prix_achat DECIMAL,
    prix_vente DECIMAL,
    quantite_disponible INT,
    seuil_alerte INT,
    unite VARCHAR(50)
);

-- Création de la table Clients
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    solde_credit DECIMAL,
    historique_paiements TEXT
);

-- Création de la table Fournisseurs
CREATE TABLE fournisseurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    historique_approvisionnement TEXT
);

-- Création de la table Dépenses
CREATE TABLE depenses (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(255),
    montant DECIMAL,
    date_depense DATE DEFAULT CURRENT_DATE
);

-- Création de la table Achats
CREATE TABLE achats (
    id SERIAL PRIMARY KEY,
    fournisseur_id INT REFERENCES fournisseurs(id),
    article_id INT REFERENCES articles(id),
    quantite INT NOT NULL,
    prix_achat DECIMAL NOT NULL,
    date_achat DATE DEFAULT CURRENT_DATE
);

-- Création de la table Ventes (avec montant_paye et reste pour le paiement partiel)
CREATE TABLE ventes (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(id),
    client_id INT REFERENCES clients(id),
    date_vente DATE DEFAULT CURRENT_DATE,
    montant_total DECIMAL,
    montant_paye DECIMAL DEFAULT 0,
    reste DECIMAL DEFAULT 0,
    mode_paiement VARCHAR(50),
    statut_livraison VARCHAR(50) DEFAULT 'En attente'
);

-- Création de la table Inventaires
CREATE TABLE inventaires (
    id SERIAL PRIMARY KEY,
    date_inventaire DATE DEFAULT CURRENT_DATE,
    utilisateur_id INT REFERENCES utilisateurs(id),
    statut VARCHAR(50) DEFAULT 'En cours'
);

-- Création de la table Mouvements de Stock
CREATE TABLE mouvements_stock (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(id),
    type_mouvement VARCHAR(50) NOT NULL,
    quantite INT NOT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INT REFERENCES utilisateurs(id),
    commentaire TEXT
);
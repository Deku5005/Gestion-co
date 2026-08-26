-- Table des Articles / Stocks
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    designation VARCHAR(255),
    prix_achat DECIMAL,
    prix_vente DECIMAL,
    quantite_disponible INT,
    seuil_alerte INT,
    unite VARCHAR(50)
);

-- Table des Clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    solde_credit DECIMAL,
    historique_paiements TEXT
);

-- Table des Utilisateurs (Admin, Vendeur, Stock)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    role VARCHAR(50)
);

-- Table des Fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    historique_approvisionnement TEXT
);

-- Table des Ventes (Point de Vente)
CREATE TABLE IF NOT EXISTS ventes (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(id),
    client_id INT REFERENCES clients(id),
    date_vente DATE,
    montant_total DECIMAL,
    mode_paiement VARCHAR(50),
    statut_livraison VARCHAR(50)
);

-- Table des Dépenses
CREATE TABLE IF NOT EXISTS depenses (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(255),
    montant DECIMAL,
    date_depense DATE
);
-- On supprime l'ancienne table si elle existe pour repartir sur une base saine
DROP TABLE IF EXISTS utilisateurs;

-- Table des Utilisateurs (Admin, Vendeur, Gestionnaire de Stock)
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL, -- Le mot de passe sera hashé
    role VARCHAR(50) NOT NULL, -- 'Admin', 'Vendeur', 'Stock'
    statut VARCHAR(50) DEFAULT 'Actif'
);

-- Table des Achats / Approvisionnements
CREATE TABLE IF NOT EXISTS achats (
    id SERIAL PRIMARY KEY,
    fournisseur_id INT REFERENCES fournisseurs(id),
    article_id INT REFERENCES articles(id),
    quantite INT NOT NULL,
    prix_achat DECIMAL NOT NULL,
    date_achat DATE DEFAULT CURRENT_DATE
);
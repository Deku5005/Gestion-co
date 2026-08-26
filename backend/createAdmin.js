const bcrypt = require('bcrypt');
const pool = require('./config/db');

const createAdmin = async () => {
    const nom = "Admin Principal";
    const email = "admin@test.com";
    const mot_de_passe = "123456";
    const role = "Admin";

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        const result = await pool.query(
            'INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING id, nom, email, role',
            [nom, email, hashedPassword, role]
        );

        console.log('✅ Admin créé avec succès !');
        console.log(result.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur lors de la création de l\'admin :', err.message);
        // Si l'admin existe déjà, on met à jour son mot de passe
        if (err.code === '23505') {
            console.log('L\'admin existe déjà. Mise à jour du mot de passe...');
            const updateResult = await pool.query(
                'UPDATE utilisateurs SET mot_de_passe = $1 WHERE email = $2 RETURNING id, nom, email, role',
                [hashedPassword, email]
            );
            console.log('✅ Admin mis à jour !');
            console.log(updateResult.rows[0]);
            process.exit(0);
        }
        process.exit(1);
    }
};

createAdmin();
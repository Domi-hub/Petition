const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

module.exports.addSigner = (userId, signature) => {
    return db.query(
        `
        INSERT INTO signatures (user_id, signature)
        VALUES($1, $2)
        RETURNING id;
        `,
        [userId, signature]
    );
};

module.exports.getUser = email => {
    return db.query(
        `
        SELECT users.id AS user_id, password, signatures.id AS signature_id
        FROM users
        LEFT JOIN signatures
        ON users.id = signatures.user_id
        WHERE email = $1;
        `,
        [email]
    );
};

module.exports.getSignature = id => {
    return db.query(
        `
        SELECT signature
        FROM signatures
        WHERE id = $1;
        `,
        [id]
    );
};

module.exports.addUser = (firstName, lastName, email, password) => {
    return db.query(
        `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES($1, $2, $3, $4)
        RETURNING id;
        `,
        [firstName, lastName, email, password]
    );
};

module.exports.getSigners = () => {
    return db.query(
        `
        SELECT first_name, last_name, age, city, url
        FROM users
        LEFT JOIN signatures
        ON users.id = signatures.user_id
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id;
        `
    );
};

module.exports.addAdditionalInfo = (age, city, homepage, user_id) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [age || null, city, homepage, user_id]
    );
};

// module.exports.getSignersByCity = city => {
//     return db.query(
//         `
//         SELECT first_name, last_name
//         FROM users
//         INNER JOIN signatures ON users.id = signatures.user_id
//         INNER JOIN user_profiles ON users.id = user_profiles.user_id
//         `,
//         [city]
//     );
// };

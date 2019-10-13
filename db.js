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

module.exports.upsertUserProfile = (age, city, url, user_id) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3
        RETURNING id
        `,
        [age || null, city, url, user_id]
    );
};

module.exports.getSignersByCity = city => {
    return db.query(
        `
        SELECT first_name, last_name, age, city, url
        FROM users
        JOIN signatures
        ON users.id = signatures.user_id
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE LOWER(city) = LOWER($1);
        `,
        [city]
    );
};

module.exports.getUserInfo = userId => {
    return db.query(
        `
        SELECT first_name, last_name, email, age, city, url
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = $1;
        `,
        [userId]
    );
};

module.exports.updateUser = (firstName, lastName, email, userId) => {
    return db.query(
        `
        UPDATE users
        SET first_name = $1, last_name = $2, email = $3
        WHERE id = $4;
        `,
        [firstName, lastName, email, userId]
    );
};

module.exports.updateUserPassword = (password, userId) => {
    return db.query(
        `
        UPDATE users
        SET password = $1
        WHERE id = $2;
        `,
        [password, userId]
    );
};

module.exports.deleteSignature = signatureId => {
    return db.query(
        `
        DELETE FROM signatures
        WHERE id = $1;
        `,
        [signatureId]
    );
};

module.exports.deleteUserProfile = userId => {
    return db.query(
        `
        DELETE FROM user_profiles
        WHERE user_id = $1;
        `,
        [userId]
    );
};

module.exports.deleteUser = userId => {
    return db.query(
        `
        DELETE FROM users
        WHERE id = $1;
        `,
        [userId]
    );
};

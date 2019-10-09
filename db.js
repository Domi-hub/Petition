const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

module.exports.addSigner = (firstName, lastName, signature, user_id) => {
    return db.query(
        `
        INSERT INTO signatures (first_name, last_name, signature, user_id)
        VALUES($1, $2, $3, $4)
        RETURNING id;
        `,
        [firstName, lastName, signature, user_id]
    );
};

module.exports.getSigners = () => {
    return db.query(
        `
        SELECT first_name, last_name
        FROM signatures;
        `
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
        `,
        [firstName, lastName, email, password]
    );
};

module.exports.getPassword = email => {
    return db.query(
        `
        SELECT password
        FROM users
        WHERE email = $1;
        `,
        [email]
    );
};

module.exports.checkSignature = user_id => {
    return db.query(
        `
        SELECT signature
        FROM signatures
        WHERE user_id = $1;
        `,
        [user_id]
    );
};

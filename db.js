const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.addSigner = (firstName, lastName, signature) => {
    return db.query(
        `
        INSERT INTO signatures (first_name, last_name, signature)
        VALUES($1, $2, $3)
        RETURNING id;
        `,
        [firstName, lastName, signature]
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

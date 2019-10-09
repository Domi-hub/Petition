let { genSalt, hash, compare } = require("bcryptjs");
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);

module.exports.hash = password => {
    return genSalt().then(salt => {
        return hash(password, salt);
    });
};

module.exports.compare = promisify(compare);

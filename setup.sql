DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE users(
     id SERIAL PRIMARY KEY,
     first_name VARCHAR NOT NULL,
     last_name VARCHAR NOT NULL,
     email VARCHAR NOT NULL UNIQUE,
     password VARCHAR NOT NULL
 );

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
	first_name VARCHAR(200) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(200) NOT NULL CHECK (last_name != ''),
    signature TEXT NOT NULL,
    user_id INT REFERENCES users(id)
);

CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR,
    url VARCHAR,
    user_id INT PREFERENCES users(id) NOT NULL UNIQUE
);

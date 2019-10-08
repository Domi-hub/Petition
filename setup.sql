DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
	first_name VARCHAR(200) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(200) NOT NULL CHECK (last_name != ''),
    signature TEXT NOT NULL,
    user_id INT REFERENCES user(id)
);psql

CREATE TABLE users(
     id SERIAL PRIMARY KEY,
     first_name VARCHAR NOT NULL,
     last_name VARCHAR NOT NULL,
     email VARCHAR NOT NULL UNIQUE,
     password VARCHAR NOT NULL
 )

DROP TABLE IF EXISTS reply_to;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS accounts;

CREATE TABLE posts (
    id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    creator VARCHAR(255) NOT NULL,
    spot VARCHAR(255) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    content VARCHAR(8000) NOT NULL,
    likes INT NOT NULL,
    dislikes INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE accounts (
    id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(1024),
    salt VARCHAR(256),
    facebook_id VARCHAR(36) UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE comments (
    id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    content varchar(255) NOT NULL,
    likes INT NOT NULL,
    dislikes INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
);

CREATE TABLE reply_to (
    id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36) NOT NULL,
    reply_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (parent_id) REFERENCES comments (id),
    FOREIGN KEY (reply_id) REFERENCES comments (id)
);

DROP TABLE IF EXISTS comments_rating;
DROP TABLE IF EXISTS posts_rating;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS accounts;

CREATE TABLE accounts (
    id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(1024) NOT NULL,
    phone VARCHAR(255) NOT NULL UNIQUE,
    salt VARCHAR(256),
    facebook_id VARCHAR(36) UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE posts (
    id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    content VARCHAR(8000) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    PRIMARY KEY (id)
);

CREATE TABLE comments (
    id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36),
    account_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    content varchar(255) NOT NULL,
    likes INT NOT NULL,
    dislikes INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
);

ALTER TABLE comments ADD FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE;

CREATE TABLE posts_rating (
    id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    UNIQUE (post_id, account_id)
);

CREATE TABLE comments_rating (
    id VARCHAR(36) NOT NULL,
    comment_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    UNIQUE (comment_id, account_id)
);

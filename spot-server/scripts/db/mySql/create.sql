DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS comments_rating;
DROP TABLE IF EXISTS posts_rating;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS friend_requests;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS password_reset;
DROP TABLE IF EXISTS locations;

DROP TABLE IF EXISTS accounts;

ALTER DATABASE db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE accounts (
    id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(1024),
    phone VARCHAR(255) UNIQUE,
    score INT,
    salt VARCHAR(256),
    role VARCHAR(36),
    facebook_id VARCHAR(36) UNIQUE,
    creation_date DATETIME NOT NULL,
    deletion_date DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE posts (
    id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    deletion_date DATETIME,
    account_id VARCHAR(36) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    geolocation VARCHAR(255),
    content VARCHAR(3000) NOT NULL,
    link VARCHAR(14) NOT NULL UNIQUE,
    image_src VARCHAR(200),
    likes INT,
    dislikes INT,
    comments INT,
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    PRIMARY KEY (id)
);

ALTER TABLE posts CHANGE content content VARCHAR(3000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE comments (
    id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36),
    account_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    deletion_date DATETIME,
    content varchar(400) NOT NULL,
    link VARCHAR(14) NOT NULL UNIQUE,
    image_src VARCHAR(200),
    likes INT,
    dislikes INT,
    PRIMARY KEY (id),
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
);

ALTER TABLE comments CHANGE content content VARCHAR(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE comments ADD FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE;

CREATE INDEX idx_comment_date ON comments(creation_date);

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

CREATE TABLE notifications (
    id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    creation_date VARCHAR(255) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    comment_id VARCHAR(36),
    reply_id VARCHAR(36),
    seen BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY (sender_id) REFERENCES accounts (id),
    FOREIGN KEY (receiver_id) REFERENCES accounts (id),
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id),
    FOREIGN KEY (reply_id) REFERENCES comments (id)
);

CREATE TABLE reports (
    id VARCHAR(36) NOT NULL,
    reporter_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    comment_id VARCHAR(36),
    content VARCHAR(200),
    creation_date DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (reporter_id) REFERENCES accounts (id),
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id)
);

CREATE TABLE friends (
    id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    friend_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    confirmed_date DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY (account_id, friend_id),
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    FOREIGN KEY (friend_id) REFERENCES accounts (id)
);

CREATE TABLE password_reset (
    id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    token VARCHAR(36) NOT NULL UNIQUE,
    PRIMARY KEY (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
);

CREATE TABLE locations (
    id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
);

CREATE TABLE tags (
    id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    comment_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id)
);

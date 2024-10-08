DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS comments_rating;
DROP TABLE IF EXISTS posts_rating;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS password_reset;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS accounts_metadata;
DROP TABLE IF EXISTS verify_account;

DROP TABLE IF EXISTS accounts;

ALTER DATABASE spot CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE accounts (
    id VARCHAR(36) NOT NULL,
    email VARCHAR(255),
    email_updated_at DATETIME,
    username VARCHAR(255) NOT NULL,
    username_updated_at DATETIME,
    pass VARCHAR(1024),
    local_account BOOLEAN GENERATED ALWAYS AS (IF(pass IS NULL, FALSE, TRUE)) VIRTUAL,
    phone VARCHAR(255),
    phone_updated_at DATETIME,
    salt VARCHAR(256),
    role VARCHAR(36),
    facebook_id VARCHAR(36),
    google_id VARCHAR(36),
    creation_date DATETIME NOT NULL,
    deletion_date DATETIME,
    verified_date DATETIME,
    not_archived int (1) GENERATED ALWAYS AS (IF(deletion_date IS NULL, 1, NULL)) VIRTUAL,
    UNIQUE (email, not_archived),
    UNIQUE (username, not_archived),
    UNIQUE (phone, not_archived),
    UNIQUE (facebook_id, not_archived),
    UNIQUE (google_id, not_archived),
    PRIMARY KEY (id)
);

CREATE TABLE accounts_metadata (
    id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    distance_unit VARCHAR(36) NOT NULL,
    search_type VARCHAR(36) NOT NULL,
    search_distance VARCHAR(36) NOT NULL,
    theme_web VARCHAR(36) NOT NULL,
    mature_filter BOOLEAN DEFAULT TRUE,
    score INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts (id),
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
    image_nsfw BOOLEAN,
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
    comment_parent_id VARCHAR(36),
    account_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    deletion_date DATETIME,
    content varchar(400) NOT NULL,
    link VARCHAR(14) NOT NULL UNIQUE,
    image_src VARCHAR(200),
    image_nsfw  BOOLEAN,
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
    content VARCHAR(300),
    creation_date DATETIME,
    category INT,
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

CREATE TABLE verify_account (
    id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    creation_date DATETIME NOT NULL,
    token VARCHAR(32) NOT NULL UNIQUE,
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
    offset INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id)
);

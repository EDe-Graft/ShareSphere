CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL
    name VARCHAR(40),
    email VARCHAR(35) UNIQUE,
    password VARCHAR NOT NULL,
    photo VARCHAR(100),
    strategy VARCHAR(15),
    profile_url VARCHAR(100) UNIQUE,
    report_count INTEGER NOT NULL,
    rating INTEGER NOT NULL,
);

CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    likes INTEGER NOT NULL,
    category VARCHAR(30) NOT NULL,
    condition VARCHAR(10) NOT NULL,
    description TEXT,
    available VARCHAR(5),
    uploader_id INTEGER NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL,
    uploader_username VARCHAR(30) NOT NULL,
    uploader_email VARCHAR(40) NOT NULL,
    uploader_photo VARCHAR(100),
    upload_date VARCHAR(30) UNIQUE,
    CONSTRAINT fk_users
        FOREIGN KEY (owner_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(50),
    edition VARCHAR(20),
    year VARCHAR(5),
    general_category VARCHAR(20) NOT NULL,
    parent_category VARCHAR(20) NOT NULL,
    sub_category VARCHAR(25) NOT NULL,
    description TEXT,
    condition VARCHAR(10) NOT NULL,
    available VARCHAR(6) NOT NULL,
    uploaded_by VARCHAR (50) NOT NULL,
    uploader_id INTEGER NOT NULL,
    uploader_email VARCHAR(40) NOT NULL,
    uploader_username VARCHAR(30) NOT NULL,
    uploader_photo VARCHAR(100),
    upload_date VARCHAR(40) NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
);

CREATE TABLE furniture (
    furniture_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    general_category VARCHAR(20) NOT NULL,
    name VARCHAR(30) NOT NULL,
    type VARCHAR(30) NOT NULL,
    brand VARCHAR(20),
    age VARCHAR(15),
    color VARCHAR(20),
    dimensions VARCHAR(35),
    material VARCHAR(25),
    description TEXT,
    condition VARCHAR(10) NOT NULL,
    available VARCHAR(6) NOT NULL,
    uploaded_by VARCHAR (50) NOT NULL,
    uploader_id INTEGER NOT NULL,
    uploader_email VARCHAR(40) NOT NULL,
    uploader_username VARCHAR(30) NOT NULL,
    uploader_photo VARCHAR(100),
    upload_date VARCHAR(40) NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
);

CREATE TABLE clothing (
    clothing_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    general_category VARCHAR(20) NOT NULL,
    name VARCHAR(30) NOT NULL,
    type VARCHAR(30) NOT NULL,
    size VARCHAR(15),
    brand VARCHAR(20),
    color VARCHAR(15),
    material VARCHAR(30),
    gender VARCHAR(10),
    description TEXT,
    condition VARCHAR(10) NOT NULL,
    available VARCHAR(5) NOT NULL,
    uploaded_by VARCHAR (50) NOT NULL,
    uploader_id INTEGER NOT NULL,
    uploader_email VARCHAR(40) NOT NULL,
    uploader_username VARCHAR(30) NOT NULL,
    uploader_photo VARCHAR(100),
    upload_date VARCHAR(40) NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
);

CREATE TABLE miscellaneous (
    miscellaneous_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    general_category VARCHAR(20) NOT NULL,
    name VARCHAR(30) NOT NULL,
    type VARCHAR(25) NOT NULL,
    brand VARCHAR(25),
    color VARCHAR (25),
    age VARCHAR(25),
    estimated_value VARCHAR(30),
    description TEXT,
    condition VARCHAR(10) NOT NULL,
    available VARCHAR(6) NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL,
    uploader_id INTEGER NOT NULL,
    uploader_email VARCHAR(40) NOT NULL,
    uploader_username VARCHAR(30) NOT NULL,
    uploader_photo VARCHAR(100),
    upload_date VARCHAR(30) NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
);

CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    image_url VARCHAR NOT NULL,
    public_id VARCHAR,
    image_type VARCHAR(20),
    item_id INTEGER NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
);

CREATE TABLE favorites (
    id SERIAL,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    item_category VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, item_id),
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_item 
        FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    reviewer_id INTEGER NOT NULL,
    reviewer_name VARCHAR(50) NOT NULL,
    reviewer_photo VARCHAR(100) NOT NULL,
    reviewed_user_id INTEGER NOT NULL,
    reviewed_user_name VARCHAR(50) NOT NULL,
    reviewed_user_photo VARCHAR(100) NOT NULL,
    item_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_category VARCHAR(20) NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviewer 
        FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    CONSTRAINT fk_reviewed_user 
        FOREIGN KEY (reviewed_user_id) REFERENCES users(user_id)
);


CREATE TABLE report_details (
  id SERIAL PRIMARY KEY,
  report_count INTEGER NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  reporter_id INTEGER NOT NULL,
  reported_user_id INTEGER NOT NULL,
  reported_user_name TEXT NOT NULL,
  reported_user_email TEXT NOT NULL,
  report_reason TEXT NOT NULL,
  report_description TEXT,
  item_id INTEGER NOT NULL,
  item_category TEXT NOT NULL,
  item_condition TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_items 
    FOREIGN KEY (item_id)
    REFERENCES items(item_id)
);

CREATE TABLE report_tracking (
    id SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    item_category TEXT NOT NULL,
    UNIQUE (reporter_user_id, reported_user_id),
    CONSTRAINT fk_users FOREIGN KEY (reporter_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_users FOREIGN KEY (reported_user_id) REFERENCES users(user_id)
);

-- Join images to items
-- SELECT 
--     images.image_id, 
--     items.item_id, 
--     items.item_owner_id
-- FROM images
-- INNER JOIN items 
--     ON images.item_id = items.item_id;

-- -- Views
-- CREATE VIEW book_likes_view AS
-- SELECT 
--     b.book_id,
--     b.title,
--     b.author,
--     b.condition,
--     b.uploaded_by,
--     b.upload_date,
--     i.item_id,
--     i.item_likes
-- FROM books b
-- JOIN items i ON b.item_id = i.item_id;

-- CREATE VIEW furniture_likes_view AS
-- SELECT 
--     f.furniture_id,
--     f.type,
--     f.condition,
--     f.upload_date,
--     i.item_id,
--     i.item_likes
-- FROM furniture f
-- JOIN items i ON f.item_id = i.item_id;

-- CREATE VIEW clothing_likes_view AS
-- SELECT 
--     c.clothing_id,
--     c.sub_category,
--     c.condition,
--     c.upload_date,
--     i.item_id,
--     i.item_likes
-- FROM clothing c
-- JOIN items i ON c.item_id = i.item_id;

-- CREATE VIEW miscellaneous_likes_view AS
-- SELECT 
--     m.miscellaneous_id,
--     m.type,
--     m.sub_category,
--     m.condition,
--     m.upload_date,
--     i.item_id,
--     i.item_likes
-- FROM miscellaneous m
-- JOIN items i ON m.item_id = i.item_id;

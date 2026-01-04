-- users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR NOT NULL,
    strategy VARCHAR(15),
    photo VARCHAR,
    photo_public_id VARCHAR(30),
    profile_url VARCHAR(100) UNIQUE,
    location VARCHAR(100),
    bio TEXT,
    joined_on VARCHAR(30) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    --add this constraint to users table after creating user_stats table
    --      ADD CONSTRAINT fk_user_stats
    --     FOREIGN KEY (user_id)
    --     REFERENCES user_stats(user_id)
    --     ON DELETE CASCADE
);

-- verification tokens table
CREATE TABLE verification_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    token_type VARCHAR(20) NOT NULL, -- 'email_verification', 'password_reset'
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    CONSTRAINT fk_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
    
-- user stats table
CREATE TABLE user_stats (
    user_id INTEGER PRIMARY KEY,
    likes_received INTEGER,
    posts_count INTEGER,
    active_posts_count INTEGER,
    inactive_posts_count INTEGER,
    review_count INTEGER,
    reviews_given INTEGER,
    reviews_received INTEGER,
    report_count INTEGER,
    average_rating DECIMAL(2, 1),
    CONSTRAINT fk_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- items table
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    likes INTEGER NOT NULL,
    category VARCHAR(30) NOT NULL,
    condition VARCHAR(10) NOT NULL,
    description TEXT,
    available VARCHAR(5),
    uploader_id INTEGER NOT NULL,
    uploaded_by VARCHAR(100),
    uploader_username VARCHAR(50) NOT NULL,
    uploader_email VARCHAR(100) NOT NULL,
    uploader_photo VARCHAR,
    upload_date VARCHAR(30) NOT NULL,
    CONSTRAINT fk_users
        FOREIGN KEY (uploader_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- books table
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(50),
    edition VARCHAR(30),
    year VARCHAR(5),
    general_category VARCHAR(20) NOT NULL,
    parent_category VARCHAR(20) NOT NULL,
    sub_category VARCHAR(25) NOT NULL,
    description TEXT,
    condition VARCHAR(10) NOT NULL,
    available VARCHAR(6) NOT NULL,
    uploader_id INTEGER NOT NULL,
    uploaded_by VARCHAR (100),
    uploader_username VARCHAR(30) NOT NULL,
    uploader_email VARCHAR(100) NOT NULL,
    uploader_photo VARCHAR,
    upload_date VARCHAR(30) NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

-- furniture table
CREATE TABLE furniture (
    furniture_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    general_category VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    brand VARCHAR(50),
    age VARCHAR(20),
    color VARCHAR(30),
    dimensions VARCHAR(40),
    material VARCHAR(40),
    description TEXT,
    condition VARCHAR(10) NOT NULL,
    available VARCHAR(6) NOT NULL,
    uploader_id INTEGER NOT NULL,
    uploaded_by VARCHAR (100),
    uploader_username VARCHAR(30) NOT NULL,
    uploader_email VARCHAR(100) NOT NULL,
    uploader_photo VARCHAR,
    upload_date VARCHAR(30) NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

-- clothing table
CREATE TABLE clothing (
    clothing_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    general_category VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    size VARCHAR(25),
    brand VARCHAR(50),
    color VARCHAR(30),
    material VARCHAR(40),
    gender VARCHAR(20),
    description TEXT,
    condition VARCHAR(10) NOT NULL,
    available VARCHAR(5) NOT NULL,
    uploader_id INTEGER NOT NULL,
    uploaded_by VARCHAR (100),
    uploader_username VARCHAR(30) NOT NULL,
    uploader_email VARCHAR(100) NOT NULL,
    uploader_photo VARCHAR,
    upload_date VARCHAR(30) NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

-- miscellaneous table
CREATE TABLE miscellaneous (
    miscellaneous_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    general_category VARCHAR(30) NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(35) NOT NULL,
    brand VARCHAR(50),
    color VARCHAR (30),
    age VARCHAR(30),
    estimated_value VARCHAR(40),
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
        ON DELETE CASCADE
);

-- images table
CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    image_url VARCHAR NOT NULL,
    public_id VARCHAR,
    image_type VARCHAR,
    item_id INTEGER NOT NULL,
    CONSTRAINT fk_items 
        FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE
);

-- favorites table
CREATE TABLE favorites (
    id SERIAL,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    item_category VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, item_id),
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
		REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_item 
        FOREIGN KEY (item_id) REFERENCES items(item_id)
        ON DELETE CASCADE
);

-- reviews table
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    reviewer_id INTEGER NOT NULL,
    reviewer_name VARCHAR(50) NOT NULL,
    reviewer_photo VARCHAR,
    reviewed_user_id INTEGER NOT NULL,
    reviewed_user_name VARCHAR(50) NOT NULL,
    reviewed_user_photo VARCHAR,
    item_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_category VARCHAR(20) NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviewer 
        FOREIGN KEY (reviewer_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviewed_user 
        FOREIGN KEY (reviewed_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- report details table
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
    ON DELETE CASCADE
);

-- report tracking table
CREATE TABLE report_tracking (
    id SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    item_category TEXT NOT NULL,
    UNIQUE (reporter_user_id, reported_user_id),
    CONSTRAINT fk_users 
    FOREIGN KEY (reported_user_id) 
    REFERENCES users(user_id)
    ON DELETE CASCADE
);


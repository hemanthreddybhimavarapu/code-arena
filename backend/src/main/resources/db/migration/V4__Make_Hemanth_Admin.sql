-- Ensure user admin with email 'codearena7.0@gmail.com' exists and has ROLE_ADMIN role.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = 'codearena7.0@gmail.com' OR username = 'admin') THEN
        UPDATE users 
        SET role_id = 2, 
            email = 'codearena7.0@gmail.com',
            password = '$2a$10$9rha4zG7cfBkKhmfMj/3X.w2V80t9W78xwEr9/Y8Fu3WTHy9B.6ku',
            is_verified = TRUE
        WHERE email = 'codearena7.0@gmail.com' OR username = 'admin';
    ELSE
        INSERT INTO users (username, email, password, role_id, is_verified, avatar) 
        VALUES ('admin', 'codearena7.0@gmail.com', '$2a$10$9rha4zG7cfBkKhmfMj/3X.w2V80t9W78xwEr9/Y8Fu3WTHy9B.6ku', 2, TRUE, 'https://api.dicebear.com/7.x/bottts/svg?seed=admin');
    END IF;
END $$;

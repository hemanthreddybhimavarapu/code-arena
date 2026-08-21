-- Ensure user hemanth with email 'iamhemanth9848@gmail.com' exists and has ROLE_ADMIN role.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = 'iamhemanth9848@gmail.com') THEN
        UPDATE users 
        SET role_id = 2, 
            is_verified = TRUE
        WHERE email = 'iamhemanth9848@gmail.com';
    ELSE
        INSERT INTO users (username, email, password, role_id, is_verified, avatar) 
        VALUES ('hemanth', 'iamhemanth9848@gmail.com', '$2a$10$9rha4zG7cfBkKhmfMj/3X.w2V80t9W78xwEr9/Y8Fu3WTHy9B.6ku', 2, TRUE, 'https://api.dicebear.com/7.x/bottts/svg?seed=hemanth');
    END IF;
END $$;

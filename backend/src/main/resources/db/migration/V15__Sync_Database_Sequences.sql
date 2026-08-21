-- Flyway migration to reset PostgreSQL primary key sequences safely
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'problems_id_seq') THEN
        PERFORM setval('problems_id_seq', COALESCE((SELECT MAX(id) FROM problems), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq') THEN
        PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'test_cases_id_seq') THEN
        PERFORM setval('test_cases_id_seq', COALESCE((SELECT MAX(id) FROM test_cases), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'hints_id_seq') THEN
        PERFORM setval('hints_id_seq', COALESCE((SELECT MAX(id) FROM hints), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'editorials_id_seq') THEN
        PERFORM setval('editorials_id_seq', COALESCE((SELECT MAX(id) FROM editorials), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tags_id_seq') THEN
        PERFORM setval('tags_id_seq', COALESCE((SELECT MAX(id) FROM tags), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'discussions_id_seq') THEN
        PERFORM setval('discussions_id_seq', COALESCE((SELECT MAX(id) FROM discussions), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'submissions_id_seq') THEN
        PERFORM setval('submissions_id_seq', COALESCE((SELECT MAX(id) FROM submissions), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'leaderboard_entries_id_seq') THEN
        PERFORM setval('leaderboard_entries_id_seq', COALESCE((SELECT MAX(id) FROM leaderboard_entries), 1));
    END IF;
END $$;

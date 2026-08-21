-- Flyway migration to trim default seed problem set to exactly 50 problems (20 Easy, 15 Medium, 15 Hard)
DO $$
DECLARE
    easy_ids BIGINT[];
    med_ids BIGINT[];
    hard_ids BIGINT[];
    keep_ids BIGINT[];
BEGIN
    SELECT array_agg(id) INTO easy_ids FROM (
        SELECT id FROM problems WHERE difficulty = 'EASY' ORDER BY id ASC LIMIT 20
    ) t;

    SELECT array_agg(id) INTO med_ids FROM (
        SELECT id FROM problems WHERE difficulty = 'MEDIUM' ORDER BY id ASC LIMIT 15
    ) t;

    SELECT array_agg(id) INTO hard_ids FROM (
        SELECT id FROM problems WHERE difficulty = 'HARD' ORDER BY id ASC LIMIT 15
    ) t;

    keep_ids := COALESCE(easy_ids, '{}'::BIGINT[]) || COALESCE(med_ids, '{}'::BIGINT[]) || COALESCE(hard_ids, '{}'::BIGINT[]);

    IF array_length(keep_ids, 1) > 0 THEN
        DELETE FROM submissions WHERE problem_id NOT IN (SELECT unnest(keep_ids));
        DELETE FROM test_cases WHERE problem_id NOT IN (SELECT unnest(keep_ids));
        DELETE FROM hints WHERE problem_id NOT IN (SELECT unnest(keep_ids));
        DELETE FROM editorials WHERE problem_id NOT IN (SELECT unnest(keep_ids));
        DELETE FROM problem_tags WHERE problem_id NOT IN (SELECT unnest(keep_ids));
        DELETE FROM discussions WHERE problem_id NOT IN (SELECT unnest(keep_ids));
        DELETE FROM problems WHERE id NOT IN (SELECT unnest(keep_ids));
    END IF;

    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'problems_id_seq') THEN
        PERFORM setval('problems_id_seq', COALESCE((SELECT MAX(id) FROM problems), 1));
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
END $$;

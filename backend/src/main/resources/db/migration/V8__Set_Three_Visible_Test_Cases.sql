-- Adjust testcase visibility so that there are 3 visible and 2 hidden test cases for each problem
WITH ranked_test_cases AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY problem_id ORDER BY id) as rn
    FROM test_cases
)
UPDATE test_cases
SET is_hidden = FALSE
WHERE id IN (
    SELECT id FROM ranked_test_cases WHERE rn = 3
);

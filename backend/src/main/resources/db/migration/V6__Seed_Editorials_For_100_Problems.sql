-- Seed default editorials for problems 5 to 104 if they do not have one
DO $$
BEGIN
    FOR i IN 5..104 LOOP
        -- check if problem exists
        IF EXISTS (SELECT 1 FROM problems WHERE id = i) THEN
            -- check if editorial exists
            IF NOT EXISTS (SELECT 1 FROM editorials WHERE problem_id = i) THEN
                INSERT INTO editorials (problem_id, content)
                VALUES (i, '### Editorial for Problem #' || i || E'\n\n#### Optimal Strategy:\n1. **Analyze Constraints**: Review the time and memory limit to choose appropriate algorithm complexity (usually O(N) or O(N log N)).\n2. **Design**: Select the proper data structures (e.g. Arrays, HashMaps, or Stack) to handle the query logic.\n3. **Optimal Implementation**: Implement the solution carefully handling boundary/edge cases like empty inputs or extreme values.\n4. **Complexity Analysis**:\n   - **Time Complexity**: O(N) where N is the size of the input.\n   - **Space Complexity**: O(1) auxiliary space.');
            END IF;
        END IF;
    END LOOP;
END $$;

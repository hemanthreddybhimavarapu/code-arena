-- Seed 100 Algorithmic Problems
DO $$
DECLARE
    p_id INT;
    t_id INT;
    i INT;
    title TEXT;
    difficulty TEXT;
    description TEXT;
    starter_java TEXT;
    starter_py TEXT;
    starter_js TEXT;
BEGIN
    FOR i IN 5..104 LOOP
        -- Alternate difficulties
        IF i % 3 = 0 THEN
            difficulty := 'EASY';
        ELSIF i % 3 = 1 THEN
            difficulty := 'MEDIUM';
        ELSE
            difficulty := 'HARD';
        END IF;

        title := 'Problem ' || i || ': Algorithmic Challenge';
        description := 'Given an array of integers, solve standard algorithmic challenge number ' || i || '. 

### Task
Implement an efficient algorithm to resolve constraints and return the summation of elements.

### Examples
- **Example 1:**
  - Input: `[1, 2, 3]`
  - Output: `6`';

        starter_java := 'import java.util.Scanner;
import java.util.Arrays;

class Solution {
    public int solve(int[] arr) {
        // TODO: Implement your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String line = sc.nextLine().trim();
        line = line.substring(1, line.length() - 1);
        if (line.isEmpty()) {
            System.out.println(0);
            return;
        }
        String[] parts = line.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }
        Solution sol = new Solution();
        System.out.println(sol.solve(arr));
    }
}';

        starter_py := 'import sys
import json

def solve(arr):
    # TODO: Implement your solution here
    return 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        arr = json.loads(line)
        print(solve(arr))
    else:
        print(0)';

        starter_js := 'const fs = require(''fs'');

function solve(arr) {
    // TODO: Implement your solution here
    return 0;
}

const input = fs.readFileSync(0, ''utf-8'').trim();
if (input) {
    console.log(solve(JSON.parse(input)));
} else {
    console.log(0);
}';

        -- Insert Problem
        INSERT INTO problems (id, title, description, difficulty, constraints, starter_code_java, starter_code_python, starter_code_js, time_limit_ms, memory_limit_mb)
        VALUES (i, title, description, difficulty, '- `1 <= array.length <= 10^3`
- `-10^4 <= array[i] <= 10^4`', starter_java, starter_py, starter_js, 5000, 512)
        RETURNING id INTO p_id;

        -- Insert Test Cases (2 visible, 3 hidden)
        INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
        (p_id, '[1,2,3]', '6', FALSE),
        (p_id, '[2,4,6]', '12', FALSE),
        (p_id, '[-1,-2,-3]', '-6', TRUE),
        (p_id, '[0]', '0', TRUE),
        (p_id, '[100,200,-50]', '250', TRUE);

        -- Map to tag (alternate tags 1 to 8)
        t_id := (i % 8) + 1;
        INSERT INTO problem_tags (problem_id, tag_id) VALUES (p_id, t_id);
    END LOOP;
END $$;

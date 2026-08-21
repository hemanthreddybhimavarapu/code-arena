-- Create Roles Table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed Roles
INSERT INTO roles (name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

-- Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_otp VARCHAR(6),
    verification_otp_expiry TIMESTAMP,
    reset_password_otp VARCHAR(6),
    reset_password_otp_expiry TIMESTAMP,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Admin and User
-- password is 'password123'
INSERT INTO users (username, email, password, role_id, is_verified, avatar) VALUES 
('admin', 'admin@codearena.com', '$2a$10$EuxH1wWJsz4C65Vl7Q1wUeD5K.JvY1B0HwX80c7B1jB3Vn3c5wFmG', 2, TRUE, 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'),
('user', 'user@codearena.com', '$2a$10$EuxH1wWJsz4C65Vl7Q1wUeD5K.JvY1B0HwX80c7B1jB3Vn3c5wFmG', 1, TRUE, 'https://api.dicebear.com/7.x/bottts/svg?seed=user');

-- Create Problems Table
CREATE TABLE problems (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    constraints TEXT,
    starter_code_java TEXT,
    starter_code_python TEXT,
    starter_code_c TEXT,
    starter_code_cpp TEXT,
    starter_code_js TEXT,
    time_limit_ms INT DEFAULT 5000,
    memory_limit_mb INT DEFAULT 512,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Test Cases Table
CREATE TABLE test_cases (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE
);

-- Create Submissions Table
CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    verdict VARCHAR(50) NOT NULL,
    execution_time_ms INT,
    memory_used_kb INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Submission Results Table
CREATE TABLE submission_results (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT REFERENCES submissions(id) ON DELETE CASCADE,
    test_case_id BIGINT REFERENCES test_cases(id) ON DELETE CASCADE,
    verdict VARCHAR(50) NOT NULL,
    execution_time_ms INT,
    memory_used_kb INT,
    stdout TEXT,
    stderr TEXT
);

-- Create Leaderboard Entries Table
CREATE TABLE leaderboard_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    solved_count INT DEFAULT 0,
    score INT DEFAULT 0,
    acceptance_rate DOUBLE PRECISION DEFAULT 0.0,
    total_execution_time BIGINT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Leaderboard for initial users
INSERT INTO leaderboard_entries (user_id, solved_count, score, acceptance_rate, total_execution_time) VALUES
(1, 0, 0, 0.0, 0),
(2, 0, 0, 0.0, 0);

-- Create Tags Table
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed Tags
INSERT INTO tags (name) VALUES 
('Array'), ('String'), ('Math'), ('Dynamic Programming'), ('Greedy'), ('Two Pointers'), ('Hash Table'), ('Sorting');

-- Create Problem Tags Join Table
CREATE TABLE problem_tags (
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

-- Create Editorials Table
CREATE TABLE editorials (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Hints Table
CREATE TABLE hints (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    hint_number INT NOT NULL,
    content TEXT NOT NULL
);

-- Create Streaks Table
CREATE TABLE streaks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_solved_date DATE
);

-- Seed Streaks
INSERT INTO streaks (user_id) VALUES (1), (2);

-- Create Bookmarks Table
CREATE TABLE bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE(user_id, problem_id)
);

-- Create Discussions Table
CREATE TABLE discussions (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id BIGINT REFERENCES discussions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Two Sum Problem
INSERT INTO problems (id, title, description, difficulty, constraints, starter_code_java, starter_code_python, starter_code_c, starter_code_cpp, starter_code_js, time_limit_ms, memory_limit_mb) VALUES
(1, 'Two Sum', 
'Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.\n\nYou may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.', 
'EASY', 
'- `2 <= nums.length <= 10^4`\n- `-10^9 <= nums[i] <= 10^9`\n- `-10^9 <= target <= 10^9`\n- Only one valid answer exists.',
'import java.util.Scanner;
import java.util.Arrays;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: Implement your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String line = sc.nextLine().trim(); // expected format: [2,7,11,15]
        int target = sc.nextInt();
        line = line.substring(1, line.length() - 1);
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        Solution sol = new Solution();
        int[] ans = sol.twoSum(nums, target);
        System.out.println("[" + ans[0] + "," + ans[1] + "]");
    }
}',
'import sys
import json

def twoSum(nums, target):
    # TODO: Implement your solution here
    return []

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        ans = twoSum(nums, target)
        print(json.dumps(ans))',
'#style
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 0;
    // TODO: Implement your solution here
    return NULL;
}

int main() {
    char buf[1024];
    if (fgets(buf, sizeof(buf), stdin) == NULL) return 0;
    int target;
    if (scanf("%d", &target) != 1) return 0;
    
    // Parse array e.g. [2,7,11,15]
    int nums[100];
    int count = 0;
    char* token = strtok(buf, "[], \n\r");
    while (token != NULL) {
        nums[count++] = atoi(token);
        token = strtok(NULL, "[], \n\r");
    }
    int returnSize;
    int* ans = twoSum(nums, count, target, &returnSize);
    printf("[%d,%d]\n", ans[0], ans[1]);
    free(ans);
    return 0;
}',
'#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: Implement your solution here
        return {};
    }
};

int main() {
    string s;
    if (!getline(cin, s)) return 0;
    int target;
    if (!(cin >> target)) return 0;

    // clean string
    for (int i = 0; i < s.length(); i++) {
        if (s[i] == ''['' || s[i] == '']'' || s[i] == '','') s[i] = '' '';
    }
    stringstream ss(s);
    int num;
    vector<int> nums;
    while (ss >> num) {
        nums.push_back(num);
    }
    Solution sol;
    vector<int> ans = sol.twoSum(nums, target);
    cout << "[" << ans[0] << "," << ans[1] << "]" << endl;
    return 0;
}',
'const fs = require(''fs'');

function twoSum(nums, target) {
    // TODO: Implement your solution here
    return [];
}

const input = fs.readFileSync(0, ''utf-8'').trim().split(''\n'');
if (input.length >= 2) {
    const nums = JSON.parse(input[0]);
    const target = parseInt(input[1]);
    console.log(JSON.stringify(twoSum(nums, target)));
}',
5000, 512);

-- Seed Two Sum Test Cases
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
(1, '[2,7,11,15]
9', '[0,1]', FALSE),
(1, '[3,2,4]
6', '[1,2]', FALSE),
(1, '[3,3]
6', '[0,1]', FALSE),
(1, '[-1,-3,-5,-7,-9]
-12', '[1,4]', TRUE),
(1, '[1000000000,5,-1000000000]
0', '[0,2]', TRUE);

-- Link Two Sum with Tags
INSERT INTO problem_tags (problem_id, tag_id) VALUES (1, 1), (1, 7);

-- Editorial for Two Sum
INSERT INTO editorials (problem_id, content) VALUES
(1, '## Two Sum - Editorial

An easy way is to search all pairs, which takes O(n^2) time.
To optimize, we can use a hash map to look up the difference in O(1) time, yielding O(n) total time complexity.');

-- Hints for Two Sum
INSERT INTO hints (problem_id, hint_number, content) VALUES
(1, 1, 'Try the brute-force approach first: check each element against every other element.'),
(1, 2, 'How can you check if the target difference already exists in a single pass? Think about dynamic structures like a Hash Map.');


-- Seed Palindrome Number Problem
INSERT INTO problems (id, title, description, difficulty, constraints, starter_code_java, starter_code_python, starter_code_c, starter_code_cpp, starter_code_js, time_limit_ms, memory_limit_mb) VALUES
(2, 'Palindrome Number', 
'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.', 
'EASY', 
'- `-2^31 <= x <= 2^31 - 1`',
'import java.util.Scanner;

class Solution {
    public boolean isPalindrome(int x) {
        // TODO: Implement your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int x = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome(x));
    }
}',
'import sys

def isPalindrome(x):
    # TODO: Implement your solution here
    return False

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(str(isPalindrome(int(line))).lower())',
'#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

bool isPalindrome(int x) {
    // TODO: Implement your solution here
    return false;
}

int main() {
    int x;
    if (scanf("%d", &x) == 1) {
        printf("%s\n", isPalindrome(x) ? "true" : "false");
    }
    return 0;
}',
'#include <iostream>

using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // TODO: Implement your solution here
        return false;
    }
};

int main() {
    int x;
    if (cin >> x) {
        Solution sol;
        cout << (sol.isPalindrome(x) ? "true" : "false") << endl;
    }
    return 0;
}',
'const fs = require(''fs'');

function isPalindrome(x) {
    // TODO: Implement your solution here
    return false;
}

const input = fs.readFileSync(0, ''utf-8'').trim();
if (input) {
    console.log(isPalindrome(parseInt(input)).toString());
}',
5000, 512);

-- Seed Palindrome Number Test Cases
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
(2, '121', 'true', FALSE),
(2, '-121', 'false', FALSE),
(2, '10', 'false', FALSE),
(2, '0', 'true', TRUE),
(2, '12321', 'true', TRUE),
(2, '123321', 'true', TRUE);

-- Link Palindrome with Tags
INSERT INTO problem_tags (problem_id, tag_id) VALUES (2, 3);

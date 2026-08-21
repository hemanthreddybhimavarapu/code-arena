package com.codearena.service;

import com.codearena.dto.SubmissionResultDto;
import com.codearena.entity.TestCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class CodeExecutionServiceTest {

    private CodeExecutionService codeExecutionService;

    @BeforeEach
    public void setUp() {
        codeExecutionService = new CodeExecutionService();
    }

    @Test
    public void testExecuteSuccess_Python() {
        String code = "import sys\n" +
                      "val = sys.stdin.read().strip()\n" +
                      "print(val)";
        String language = "python";
        TestCase tc1 = TestCase.builder()
                .id(1L)
                .input("hello_python")
                .expectedOutput("hello_python")
                .isHidden(false)
                .build();

        List<SubmissionResultDto> results = codeExecutionService.execute(code, language, List.of(tc1), 15000);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("ACCEPTED", results.get(0).getVerdict());
        assertEquals("hello_python\n", results.get(0).getStdout());
    }

    @Test
    public void testExecuteSuccess_Java() {
        String code = "import java.util.Scanner;\n" +
                      "public class Solution {\n" +
                      "    public static void main(String[] args) {\n" +
                      "        Scanner sc = new Scanner(System.in);\n" +
                      "        if (sc.hasNext()) {\n" +
                      "            System.out.println(sc.next());\n" +
                      "        }\n" +
                      "    }\n" +
                      "}";
        String language = "java";
        TestCase tc1 = TestCase.builder()
                .id(2L)
                .input("hello_java")
                .expectedOutput("hello_java")
                .isHidden(false)
                .build();

        List<SubmissionResultDto> results = codeExecutionService.execute(code, language, List.of(tc1), 15000);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("ACCEPTED", results.get(0).getVerdict());
        assertEquals("hello_java\n", results.get(0).getStdout());
    }

    @Test
    public void testCompilationFailure_Java() {
        String code = "public class Solution {\n" +
                      "    public static void main(String[] args) {\n" +
                      "        this is syntax error;\n" +
                      "    }\n" +
                      "}";
        String language = "java";
        TestCase tc1 = TestCase.builder()
                .id(3L)
                .input("")
                .expectedOutput("")
                .isHidden(false)
                .build();

        List<SubmissionResultDto> results = codeExecutionService.execute(code, language, List.of(tc1), 15000);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("COMPILATION_ERROR", results.get(0).getVerdict());
        assertFalse(results.get(0).getStderr().isEmpty());
    }

    @Test
    public void testTimeout_Python() {
        String code = "import time\n" +
                      "while True:\n" +
                      "    time.sleep(0.1)";
        String language = "python";
        TestCase tc1 = TestCase.builder()
                .id(4L)
                .input("")
                .expectedOutput("")
                .isHidden(false)
                .build();

        // 1.5 seconds timeout limit
        List<SubmissionResultDto> results = codeExecutionService.execute(code, language, List.of(tc1), 1500);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("TIME_LIMIT_EXCEEDED", results.get(0).getVerdict());
    }

    @Test
    public void testOOM_Python() {
        // Try to allocate 600MB memory in a container capped at 512MB
        String code = "try:\n" +
                      "    large_mem = bytearray(600 * 1024 * 1024)\n" +
                      "    print('SUCCESS')\n" +
                      "except Exception as e:\n" +
                      "    print('OOM_FAIL')\n";
        String language = "python";
        TestCase tc1 = TestCase.builder()
                .id(5L)
                .input("")
                .expectedOutput("SUCCESS")
                .isHidden(false)
                .build();

        List<SubmissionResultDto> results = codeExecutionService.execute(code, language, List.of(tc1), 15000);
        assertNotNull(results);
        assertEquals(1, results.size());
        String verdict = results.get(0).getVerdict();
        assertTrue("MEMORY_LIMIT_EXCEEDED".equals(verdict) || "TIME_LIMIT_EXCEEDED".equals(verdict),
                "Expected MEMORY_LIMIT_EXCEEDED or TIME_LIMIT_EXCEEDED, but got: " + verdict);
    }

    @Test
    public void testIsolation_NetworkAndFS_Python() {
        // Try to make a network request (network is none) and check FS roots
        String code = "import urllib.request\n" +
                      "import os\n" +
                      "network_ok = False\n" +
                      "try:\n" +
                      "    urllib.request.urlopen('http://8.8.8.8', timeout=1)\n" +
                      "    network_ok = True\n" +
                      "except Exception:\n" +
                      "    network_ok = False\n" +
                      "\n" +
                      "dirs = os.listdir('/')\n" +
                      "fs_isolated = 'Program Files' not in dirs and 'Users' not in dirs\n" +
                      "if not network_ok and fs_isolated:\n" +
                      "    print('ISOLATED')\n" +
                      "else:\n" +
                      "    print('EXPOSED')\n";
        String language = "python";
        TestCase tc1 = TestCase.builder()
                .id(6L)
                .input("")
                .expectedOutput("ISOLATED")
                .isHidden(false)
                .build();

        List<SubmissionResultDto> results = codeExecutionService.execute(code, language, List.of(tc1), 15000);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("ACCEPTED", results.get(0).getVerdict());
        assertEquals("ISOLATED\n", results.get(0).getStdout());
    }
}

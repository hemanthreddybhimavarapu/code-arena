package com.codearena.service;

import com.codearena.dto.SubmissionResultDto;
import com.codearena.entity.TestCase;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.TimeUnit;

@Service
@SuppressWarnings("null")
public class CodeExecutionService {

    private final Path tempSubmissionsPath = Paths.get(System.getProperty("java.io.tmpdir"), "codearena_temp_submissions");
    private Boolean dockerAvailable = null;

    private synchronized boolean isDockerAvailable() {
        if (dockerAvailable != null) {
            return dockerAvailable;
        }
        try {
            Process process = new ProcessBuilder("docker", "ps").start();
            boolean finished = process.waitFor(2, TimeUnit.SECONDS);
            if (finished && process.exitValue() == 0) {
                dockerAvailable = true;
            } else {
                dockerAvailable = false;
            }
        } catch (Exception e) {
            dockerAvailable = false;
        }
        return dockerAvailable;
    }

    public CodeExecutionService() {
        try {
            Files.createDirectories(tempSubmissionsPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize temp submissions directory", e);
        }
    }

    public static class RunResult {
        public String verdict; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR, etc.
        public int timeMs;
        public int memoryKb;
        public String stdout = "";
        public String stderr = "";
    }

    public List<SubmissionResultDto> execute(String code, String language, List<TestCase> testCases, int timeLimitMs) {
        String submissionId = UUID.randomUUID().toString();
        Path submissionDir = tempSubmissionsPath.resolve(submissionId);

        try {
            Files.createDirectories(submissionDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create submission directory", e);
        }

        String fileName = getFileName(language);
        Path codeFile = submissionDir.resolve(fileName);
        try {
            Files.writeString(codeFile, code);
        } catch (IOException e) {
            cleanupDirectory(submissionDir);
            throw new RuntimeException("Failed to write source code file", e);
        }

        boolean dockerActive = isDockerAvailable();
        // Compilation step if needed
        boolean compiled = dockerActive
                ? compileCode(language, submissionDir, fileName)
                : compileCodeLocal(language, submissionDir, fileName);
        if (!compiled) {
            List<SubmissionResultDto> results = new ArrayList<>();
            String compError = readCompilationError(submissionDir);
            for (TestCase tc : testCases) {
                results.add(SubmissionResultDto.builder()
                        .testCaseId(tc.getId())
                        .verdict("COMPILATION_ERROR")
                        .executionTimeMs(0)
                        .memoryUsedKb(0)
                        .stdout("")
                        .stderr(compError)
                        .input(tc.getInput())
                        .expectedOutput(tc.getExpectedOutput())
                        .isHidden(tc.getIsHidden())
                        .build());
            }
            cleanupDirectory(submissionDir);
            return results;
        }

        // Run test cases
        List<SubmissionResultDto> results = new ArrayList<>();
        int tcIndex = 1;
        for (TestCase tc : testCases) {
            RunResult rr;
            if (dockerActive) {
                String containerName = "codearena_sub_" + submissionId + "_" + tcIndex;
                rr = runCode(language, submissionDir, fileName, tc.getInput(), timeLimitMs, containerName);
            } else {
                rr = runCodeLocal(language, submissionDir, fileName, tc.getInput(), timeLimitMs);
            }
            
            // Verdict mapping
            String verdict = rr.verdict;
            if (verdict.equals("SUCCESS")) {
                if (compareOutput(rr.stdout, tc.getExpectedOutput())) {
                    verdict = "ACCEPTED";
                } else {
                    verdict = "WRONG_ANSWER";
                }
            }

            results.add(SubmissionResultDto.builder()
                    .testCaseId(tc.getId())
                    .verdict(verdict)
                    .executionTimeMs(rr.timeMs)
                    .memoryUsedKb(rr.memoryKb)
                    .stdout(rr.stdout)
                    .stderr(rr.stderr)
                    .input(tc.getInput())
                    .expectedOutput(tc.getExpectedOutput())
                    .isHidden(tc.getIsHidden())
                    .build());
            tcIndex++;
        }

        cleanupDirectory(submissionDir);
        return results;
    }

    private String getFileName(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> "Solution.java";
            case "python" -> "solution.py";
            case "c" -> "solution.c";
            case "cpp" -> "solution.cpp";
            case "javascript" -> "solution.js";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String getDockerImage(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> "eclipse-temurin:17";
            case "python" -> "python:3.11-slim";
            case "c", "cpp" -> "gcc:latest";
            case "javascript" -> "node:18-slim";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private boolean compileCode(String language, Path submissionDir, String fileName) {
        String lang = language.toLowerCase();
        if (!lang.equals("java") && !lang.equals("c") && !lang.equals("cpp")) {
            return true; // Interpreted languages don't need compile step
        }

        String image = getDockerImage(lang);
        List<String> compileCmd = new ArrayList<>();
        compileCmd.addAll(List.of("docker", "run", "--rm", "-v", submissionDir.toAbsolutePath().toString().replace("\\", "/") + ":/app", "-w", "/app", image));

        if (lang.equals("java")) {
            compileCmd.add("javac");
            compileCmd.add(fileName);
        } else if (lang.equals("c")) {
            compileCmd.addAll(List.of("gcc", "-O2", "solution.c", "-o", "solution"));
        } else {
            compileCmd.addAll(List.of("g++", "-O2", "solution.cpp", "-o", "solution"));
        }

        try {
            ProcessBuilder pb = new ProcessBuilder(compileCmd);
            Path errorLog = submissionDir.resolve("compile_error.txt");
            pb.redirectError(errorLog.toFile());
            pb.redirectOutput(errorLog.toFile());

            Process process = pb.start();
            boolean finished = process.waitFor(15, TimeUnit.SECONDS); // compile timeout
            if (!finished) {
                process.destroyForcibly();
                Files.writeString(errorLog, "Compilation timed out.");
                return false;
            }
            return process.exitValue() == 0;
        } catch (Exception e) {
            try {
                Files.writeString(submissionDir.resolve("compile_error.txt"), "Internal execution error: " + e.getMessage());
            } catch (IOException ignored) {}
            return false;
        }
    }

    private String readCompilationError(Path submissionDir) {
        try {
            return Files.readString(submissionDir.resolve("compile_error.txt"));
        } catch (IOException e) {
            return "Unknown compilation error.";
        }
    }

    private RunResult runCode(String language, Path submissionDir, String fileName, String inputData, int timeLimitMs, String containerName) {
        RunResult rr = new RunResult();
        String image = getDockerImage(language);
        List<String> runCmd = new ArrayList<>();
        
        // docker run -i --name containerName --rm --network none --memory 512m --cpus 1.0 -v hostDir:/app -w /app imageCmd
        runCmd.addAll(List.of(
            "docker", "run", "-i", "--name", containerName, "--rm",
            "--network", "none",
            "--memory", "512m",
            "--memory-swap", "512m",
            "--cpus", "1.0",
            "-v", submissionDir.toAbsolutePath().toString().replace("\\", "/") + ":/app",
            "-w", "/app",
            image
        ));

        String lang = language.toLowerCase();
        if (lang.equals("java")) {
            runCmd.addAll(List.of("java", "Solution"));
        } else if (lang.equals("python")) {
            runCmd.addAll(List.of("python", fileName));
        } else if (lang.equals("c") || lang.equals("cpp")) {
            runCmd.add("./solution");
        } else if (lang.equals("javascript")) {
            runCmd.addAll(List.of("node", fileName));
        }

        Process process = null;
        try {
            ProcessBuilder pb = new ProcessBuilder(runCmd);
            long startTime = System.currentTimeMillis();
            process = pb.start();

            // Feed input data
            if (inputData != null && !inputData.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8))) {
                    writer.write(inputData);
                    writer.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            boolean finished = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
            long endTime = System.currentTimeMillis();
            rr.timeMs = (int) (endTime - startTime);
            rr.memoryKb = 15000; // Mock resource parsing value within limits (Docker memory limit handles actual caps)

            if (!finished) {
                // Time Limit Exceeded
                killContainer(containerName);
                process.destroyForcibly();
                rr.verdict = "TIME_LIMIT_EXCEEDED";
                rr.stderr = "Execution timed out (Limit: " + timeLimitMs + "ms)";
                return rr;
            }

            // Read output
            StringBuilder outSb = new StringBuilder();
            StringBuilder errSb = new StringBuilder();
            
            try (BufferedReader outReader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8));
                 BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                
                String line;
                while ((line = outReader.readLine()) != null) {
                    outSb.append(line).append("\n");
                }
                while ((line = errReader.readLine()) != null) {
                    errSb.append(line).append("\n");
                }
            }

            int exitCode = process.exitValue();
            rr.stdout = outSb.toString();
            rr.stderr = errSb.toString();

            if (exitCode == 137) {
                rr.verdict = "MEMORY_LIMIT_EXCEEDED";
                rr.stderr = "Memory Limit Exceeded (Limit: 512 MB)";
            } else if (exitCode != 0) {
                rr.verdict = "RUNTIME_ERROR";
                if (rr.stderr.isEmpty()) {
                    rr.stderr = "Process exited with code: " + exitCode;
                }
            } else {
                rr.verdict = "SUCCESS";
            }

        } catch (Exception e) {
            killContainer(containerName);
            rr.verdict = "RUNTIME_ERROR";
            rr.stderr = "Internal processing error: " + e.getMessage();
        }

        return rr;
    }

    private void killContainer(String containerName) {
        try {
            new ProcessBuilder("docker", "kill", containerName).start().waitFor();
        } catch (Exception ignored) {}
    }

    private void cleanupDirectory(Path dir) {
        try {
            Files.walk(dir)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
        } catch (IOException ignored) {}
    }

    private boolean compileCodeLocal(String language, Path submissionDir, String fileName) {
        String lang = language.toLowerCase();
        if (!lang.equals("java") && !lang.equals("c") && !lang.equals("cpp")) {
            return true;
        }

        List<String> compileCmd = new ArrayList<>();
        if (lang.equals("java")) {
            compileCmd.addAll(List.of("javac", fileName));
        } else if (lang.equals("c")) {
            String outName = System.getProperty("os.name").toLowerCase().contains("win") ? "solution.exe" : "solution";
            compileCmd.addAll(List.of("gcc", "-O2", "solution.c", "-o", outName));
        } else {
            String outName = System.getProperty("os.name").toLowerCase().contains("win") ? "solution.exe" : "solution";
            compileCmd.addAll(List.of("g++", "-O2", "solution.cpp", "-o", outName));
        }

        try {
            ProcessBuilder pb = new ProcessBuilder(compileCmd);
            pb.directory(submissionDir.toFile());
            Path errorLog = submissionDir.resolve("compile_error.txt");
            pb.redirectError(errorLog.toFile());
            pb.redirectOutput(errorLog.toFile());

            Process process = pb.start();
            boolean finished = process.waitFor(15, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                Files.writeString(errorLog, "Local compilation timed out.");
                return false;
            }
            return process.exitValue() == 0;
        } catch (Exception e) {
            try {
                Files.writeString(submissionDir.resolve("compile_error.txt"), "Internal local compilation error: " + e.getMessage());
            } catch (IOException ignored) {}
            return false;
        }
    }

    private RunResult runCodeLocal(String language, Path submissionDir, String fileName, String inputData, int timeLimitMs) {
        RunResult rr = new RunResult();
        List<String> runCmd = new ArrayList<>();

        String lang = language.toLowerCase();
        if (lang.equals("java")) {
            runCmd.addAll(List.of("java", "Solution"));
        } else if (lang.equals("python")) {
            String pythonCmd = System.getProperty("os.name").toLowerCase().contains("win") ? "python" : "python3";
            runCmd.addAll(List.of(pythonCmd, fileName));
        } else if (lang.equals("c") || lang.equals("cpp")) {
            String binary = System.getProperty("os.name").toLowerCase().contains("win") ? "solution.exe" : "./solution";
            runCmd.add(binary);
        } else if (lang.equals("javascript")) {
            runCmd.addAll(List.of("node", fileName));
        }

        Process process = null;
        try {
            ProcessBuilder pb = new ProcessBuilder(runCmd);
            pb.directory(submissionDir.toFile());
            long startTime = System.currentTimeMillis();
            process = pb.start();

            // Feed input data
            if (inputData != null && !inputData.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8))) {
                    writer.write(inputData);
                    writer.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            boolean finished = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
            long endTime = System.currentTimeMillis();
            rr.timeMs = (int) (endTime - startTime);
            rr.memoryKb = 15000;

            if (!finished) {
                process.destroyForcibly();
                rr.verdict = "TIME_LIMIT_EXCEEDED";
                rr.stderr = "Execution timed out (Limit: " + timeLimitMs + "ms)";
                return rr;
            }

            StringBuilder outSb = new StringBuilder();
            StringBuilder errSb = new StringBuilder();

            try (BufferedReader outReader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8));
                 BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {

                String line;
                while ((line = outReader.readLine()) != null) {
                    outSb.append(line).append("\n");
                }
                while ((line = errReader.readLine()) != null) {
                    errSb.append(line).append("\n");
                }
            }

            int exitCode = process.exitValue();
            rr.stdout = outSb.toString();
            rr.stderr = errSb.toString();

            if (exitCode != 0) {
                rr.verdict = "RUNTIME_ERROR";
                if (rr.stderr.isEmpty()) {
                    rr.stderr = "Process exited with local code: " + exitCode;
                }
            } else {
                rr.verdict = "SUCCESS";
            }

        } catch (Exception e) {
            if (process != null) {
                process.destroyForcibly();
            }
            rr.verdict = "RUNTIME_ERROR";
            rr.stderr = "Internal local processing error: " + e.getMessage();
        }

        return rr;
    }

    private boolean compareOutput(String actual, String expected) {
        if (actual == null) actual = "";
        if (expected == null) expected = "";

        String normActual = actual.replace("\r\n", "\n").trim();
        String normExpected = expected.replace("\r\n", "\n").trim();

        if (normActual.equals(normExpected)) {
            return true;
        }

        List<String> actualLines = Arrays.stream(normActual.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        List<String> expectedLines = Arrays.stream(normExpected.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        if (actualLines.equals(expectedLines)) {
            return true;
        }

        String cleanActual = normActual.replaceAll("\\s+", " ")
                .replaceAll("\\s*,\\s*", ",")
                .replaceAll("\\[\\s*", "[")
                .replaceAll("\\s*\\]", "]");
        String cleanExpected = normExpected.replaceAll("\\s+", " ")
                .replaceAll("\\s*,\\s*", ",")
                .replaceAll("\\[\\s*", "[")
                .replaceAll("\\s*\\]", "]");

        if (cleanActual.equalsIgnoreCase(cleanExpected)) {
            return true;
        }

        if (actualLines.size() == expectedLines.size()) {
            boolean allMatch = true;
            for (int i = 0; i < actualLines.size(); i++) {
                String aLine = actualLines.get(i).replaceAll("\\s+", " ")
                        .replaceAll("\\s*,\\s*", ",")
                        .replaceAll("\\[\\s*", "[")
                        .replaceAll("\\s*\\]", "]");
                String eLine = expectedLines.get(i).replaceAll("\\s+", " ")
                        .replaceAll("\\s*,\\s*", ",")
                        .replaceAll("\\[\\s*", "[")
                        .replaceAll("\\s*\\]", "]");
                if (!aLine.equalsIgnoreCase(eLine)) {
                    allMatch = false;
                    break;
                }
            }
            if (allMatch) return true;
        }

        return false;
    }
}

package com.codearena.repository;

import com.codearena.entity.Submission;
import com.codearena.entity.Verdict;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Submission> findByProblemIdOrderByCreatedAtDesc(Long problemId);
    List<Submission> findByUserIdAndProblemIdOrderByCreatedAtDesc(Long userId, Long problemId);
    
    long countByUserId(Long userId);
    long countByUserIdAndVerdict(Long userId, Verdict verdict);
    long countByUserIdAndProblemIdAndCreatedAtAfter(Long userId, Long problemId, LocalDateTime createdAt);
    long countByProblemId(Long problemId);
    long countByProblemIdAndVerdict(Long problemId, Verdict verdict);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s WHERE s.user.id = :userId AND s.verdict = com.codearena.entity.Verdict.ACCEPTED")
    long countDistinctProblemsSolvedByUserId(@Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Submission s WHERE s.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s WHERE s.user.id = :userId AND s.verdict = 'ACCEPTED' AND s.createdAt >= :startOfDay AND s.createdAt <= :endOfDay")
    long countDistinctProblemsSolvedByUserIdAndDate(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query(value = "SELECT u.id AS userId, u.username AS username, u.avatar AS avatar, " +
           "CAST(COUNT(DISTINCT s.problem_id) AS integer) AS solvedCount, " +
           "CAST(SUM(CASE WHEN p.difficulty = 'EASY' THEN 10 WHEN p.difficulty = 'MEDIUM' THEN 20 ELSE 30 END) AS integer) AS score " +
           "FROM submissions s " +
           "JOIN users u ON s.user_id = u.id " +
           "JOIN roles r ON u.role_id = r.id " +
           "JOIN problems p ON s.problem_id = p.id " +
           "WHERE s.verdict = 'ACCEPTED' AND r.name != 'ROLE_ADMIN' AND s.created_at >= :startDate " +
           "GROUP BY u.id, u.username, u.avatar " +
           "ORDER BY solvedCount DESC, score DESC", nativeQuery = true)
    List<Object[]> getLeaderboardByDateAfterNative(@Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT u.id AS userId, u.username AS username, u.avatar AS avatar, " +
           "CAST(COUNT(DISTINCT s.problem_id) AS integer) AS solvedCount, " +
           "CAST(SUM(CASE WHEN p.difficulty = 'EASY' THEN 10 WHEN p.difficulty = 'MEDIUM' THEN 20 ELSE 30 END) AS integer) AS score " +
           "FROM submissions s " +
           "JOIN users u ON s.user_id = u.id " +
           "JOIN roles r ON u.role_id = r.id " +
           "JOIN problems p ON s.problem_id = p.id " +
           "WHERE s.verdict = 'ACCEPTED' AND r.name != 'ROLE_ADMIN' AND LOWER(s.language) = LOWER(:language) " +
           "GROUP BY u.id, u.username, u.avatar " +
           "ORDER BY solvedCount DESC, score DESC", nativeQuery = true)
    List<Object[]> getLeaderboardByLanguageNative(@Param("language") String language);

    @Query(value = "SELECT u.id AS userId, u.username AS username, u.avatar AS avatar, " +
           "CAST(COUNT(DISTINCT s.problem_id) AS integer) AS solvedCount, " +
           "CAST(SUM(CASE WHEN p.difficulty = 'EASY' THEN 10 WHEN p.difficulty = 'MEDIUM' THEN 20 ELSE 30 END) AS integer) AS score " +
           "FROM submissions s " +
           "JOIN users u ON s.user_id = u.id " +
           "JOIN roles r ON u.role_id = r.id " +
           "JOIN problems p ON s.problem_id = p.id " +
           "WHERE s.verdict = 'ACCEPTED' AND r.name != 'ROLE_ADMIN' AND s.created_at >= :startDate AND LOWER(s.language) = LOWER(:language) " +
           "GROUP BY u.id, u.username, u.avatar " +
           "ORDER BY solvedCount DESC, score DESC", nativeQuery = true)
    List<Object[]> getLeaderboardByDateAndLanguageNative(@Param("startDate") java.time.LocalDateTime startDate, @Param("language") String language);
}

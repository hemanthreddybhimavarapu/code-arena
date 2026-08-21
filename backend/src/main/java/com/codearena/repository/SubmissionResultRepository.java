package com.codearena.repository;

import com.codearena.entity.SubmissionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SubmissionResultRepository extends JpaRepository<SubmissionResult, Long> {
    List<SubmissionResult> findBySubmissionId(Long submissionId);

    @Modifying
    @Query("DELETE FROM SubmissionResult sr WHERE sr.submission.id IN (SELECT s.id FROM Submission s WHERE s.user.id = :userId)")
    void deleteByUserId(@Param("userId") Long userId);
}


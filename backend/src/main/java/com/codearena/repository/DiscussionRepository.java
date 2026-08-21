package com.codearena.repository;

import com.codearena.entity.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DiscussionRepository extends JpaRepository<Discussion, Long> {
    List<Discussion> findByProblemIdOrderByCreatedAtDesc(Long problemId);

    @Modifying
    @Query("DELETE FROM Discussion d WHERE d.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

package com.codearena.repository;

import com.codearena.entity.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {
    Optional<LeaderboardEntry> findByUserId(Long userId);
    List<LeaderboardEntry> findAllByOrderByScoreDescSolvedCountDescTotalExecutionTimeAscAcceptanceRateDescLastUpdatedAsc();

    @Modifying
    @Query("DELETE FROM LeaderboardEntry l WHERE l.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

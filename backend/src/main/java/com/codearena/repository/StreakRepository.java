package com.codearena.repository;

import com.codearena.entity.Streak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface StreakRepository extends JpaRepository<Streak, Long> {
    Optional<Streak> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM Streak s WHERE s.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

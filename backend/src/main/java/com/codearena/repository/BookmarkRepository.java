package com.codearena.repository;

import com.codearena.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserIdAndProblemId(Long userId, Long problemId);
    List<Bookmark> findByUserId(Long userId);
    boolean existsByUserIdAndProblemId(Long userId, Long problemId);

    @Modifying
    @Query("DELETE FROM Bookmark b WHERE b.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

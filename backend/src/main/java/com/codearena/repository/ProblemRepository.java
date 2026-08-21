package com.codearena.repository;

import com.codearena.entity.Problem;
import com.codearena.entity.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    
    List<Problem> findByTitle(String title);

    @Query("SELECT DISTINCT p FROM Problem p LEFT JOIN p.tags t WHERE " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))) AND " +
           "(:difficulty IS NULL OR p.difficulty = :difficulty) AND " +
           "(:tag IS NULL OR t.name = :tag)")
    List<Problem> searchProblems(@Param("query") String query, 
                                 @Param("difficulty") Difficulty difficulty, 
                                 @Param("tag") String tag);
}

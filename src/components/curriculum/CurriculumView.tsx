/**
 * @file CurriculumView.tsx
 * @description Main curriculum view component showing all modules and lessons.
 *
 * Features:
 * - All modules as expandable cards
 * - Filter by status (All, In Progress, Completed)
 * - Search by lesson name
 * - Progress statistics summary
 */

'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Star, Trophy, Target, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  CURRICULUM_MODULES,
  LESSONS_BY_ID,
  type Lesson,
} from '@/lib/curriculum';
import { useCurriculumProgress } from '@/hooks/useCurriculumProgress';
import { ModuleCard } from './ModuleCard';
import { LessonItem } from './LessonItem';

export type FilterOption = 'all' | 'in-progress' | 'completed';

export interface CurriculumViewProps {
  /** Callback when a lesson is selected to start */
  onStartLesson?: (lesson: Lesson) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CurriculumView - Main curriculum display with modules and lessons
 */
export function CurriculumView({ onStartLesson, className = '' }: CurriculumViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  const {
    progress,
    completedLessons,
    lessonScores,
    isLessonUnlocked,
    getModuleProgress,
    getTotalStars,
    isLoading,
  } = useCurriculumProgress();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLessons = Object.keys(LESSONS_BY_ID).length;
    const completed = completedLessons.size;
    const totalStars = getTotalStars();
    const maxStars = totalLessons * 3;
    const averageWPM = progress?.averageWPM || 0;

    return {
      totalLessons,
      completed,
      percentage: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
      totalStars,
      maxStars,
      averageWPM,
    };
  }, [completedLessons, getTotalStars, progress]);

  // Filter and search modules
  const filteredModules = useMemo(() => {
    return CURRICULUM_MODULES.map((module) => {
      const lessons = module.lessonIds
        .map((id) => LESSONS_BY_ID[id])
        .filter(Boolean)
        .filter((lesson) => {
          // Apply search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName =
              lesson.name.toLowerCase().includes(query) ||
              lesson.nameEn.toLowerCase().includes(query);
            const matchesDescription =
              lesson.description.toLowerCase().includes(query) ||
              lesson.descriptionEn.toLowerCase().includes(query);
            if (!matchesName && !matchesDescription) return false;
          }

          // Apply status filter
          const isCompleted = completedLessons.has(lesson.id);
          const isUnlocked = isLessonUnlocked(lesson.id);

          switch (filter) {
            case 'completed':
              return isCompleted;
            case 'in-progress':
              return isUnlocked && !isCompleted;
            case 'all':
            default:
              return true;
          }
        });

      return { module, lessons };
    }).filter(({ lessons }) => lessons.length > 0 || (!searchQuery && filter === 'all'));
  }, [searchQuery, filter, completedLessons, isLessonUnlocked]);

  // Check if module is unlocked (first lesson is unlocked)
  const isModuleUnlocked = (moduleId: string): boolean => {
    const module = CURRICULUM_MODULES.find((m) => m.id === moduleId);
    if (!module || module.lessonIds.length === 0) return false;
    return isLessonUnlocked(module.lessonIds[0]);
  };

  // Check if module is completed (all lessons completed)
  const isModuleCompleted = (moduleId: string): boolean => {
    const module = CURRICULUM_MODULES.find((m) => m.id === moduleId);
    if (!module || module.lessonIds.length === 0) return false;
    return module.lessonIds.every((id) => completedLessons.has(id));
  };

  const handleStartLesson = (lesson: Lesson) => {
    onStartLesson?.(lesson);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-0 border border-border-muted rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {stats.completed}/{stats.totalLessons}
              </p>
              <p className="text-sm text-foreground/60">Lecciones</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-0 border border-border-muted rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {stats.totalStars}
              </p>
              <p className="text-sm text-foreground/60">Estrellas</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-0 border border-border-muted rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {stats.percentage}%
              </p>
              <p className="text-sm text-foreground/60">Completado</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-0 border border-border-muted rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {stats.averageWPM.toFixed(0)}
              </p>
              <p className="text-sm text-foreground/60">WPM Prom.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Buscar lecciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg',
              'bg-surface-0 border border-border-muted',
              'text-foreground placeholder:text-foreground/40',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary',
              'transition-colors'
            )}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-foreground/40" />
          {(['all', 'in-progress', 'completed'] as FilterOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium',
                'transition-colors',
                filter === option
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-0 text-foreground/60 hover:bg-surface-1 border border-border-muted'
              )}
            >
              {option === 'all' && 'Todas'}
              {option === 'in-progress' && 'En progreso'}
              {option === 'completed' && 'Completadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <div className="text-center py-12 text-foreground/50">
            <p>No se encontraron lecciones.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-accent-primary hover:underline"
              >
                Limpiar busqueda
              </button>
            )}
          </div>
        ) : (
          filteredModules.map(({ module, lessons }) => {
            const moduleProgress = getModuleProgress(module.id);
            const unlocked = isModuleUnlocked(module.id);
            const completed = isModuleCompleted(module.id);

            return (
              <ModuleCard
                key={module.id}
                module={module}
                lessons={lessons}
                progress={moduleProgress}
                isUnlocked={unlocked}
                isCompleted={completed}
                defaultExpanded={filter !== 'all' || !!searchQuery}
              >
                {lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    score={lessonScores.get(lesson.id)}
                    isUnlocked={isLessonUnlocked(lesson.id)}
                    onStart={handleStartLesson}
                  />
                ))}
              </ModuleCard>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CurriculumView;

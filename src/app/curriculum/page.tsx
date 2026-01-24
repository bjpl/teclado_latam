/**
 * @file page.tsx
 * @description Curriculum page at /curriculum route.
 *
 * Displays the typing curriculum with all modules and lessons,
 * allowing users to track progress and start practice sessions.
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CurriculumView } from '@/components/curriculum';
import type { Lesson } from '@/lib/curriculum';

/**
 * CurriculumPage - Main curriculum browsing page
 */
export default function CurriculumPage() {
  const router = useRouter();

  /**
   * Navigate to practice page with the selected lesson
   */
  const handleStartLesson = (lesson: Lesson) => {
    // Navigate to main page with lesson ID as query parameter
    router.push(`/?lessonId=${encodeURIComponent(lesson.id)}`);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onSettingsClick={handleSettingsClick} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        {/* Page Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a practica
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Curriculum</h1>
          <p className="text-foreground/60 mt-1">
            Progresa a traves de lecciones estructuradas para dominar el teclado LATAM
          </p>
        </div>

        {/* Curriculum Content */}
        <CurriculumView onStartLesson={handleStartLesson} />
      </main>

      <Footer />
    </div>
  );
}

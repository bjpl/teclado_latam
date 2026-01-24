'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInputModal } from './TextInputModal';

export type TextSelectorTab = 'samples' | 'saved' | 'custom';

export interface SampleText {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** The practice text content */
  text: string;
  /** Category or tag */
  category?: string;
  /** Character count */
  charCount: number;
}

export interface SavedText {
  /** Unique identifier */
  id: string;
  /** User-provided title */
  title: string;
  /** The saved text content */
  text: string;
  /** When the text was saved */
  savedAt: Date;
  /** Character count */
  charCount: number;
}

export interface TextSelectorProps {
  /** Callback when user selects a text to practice */
  onSelectText: (text: string) => void;
  /** List of pre-defined sample texts */
  sampleTexts?: SampleText[];
  /** List of user-saved texts */
  savedTexts?: SavedText[];
  /** Callback when user deletes a saved text */
  onDeleteSaved?: (id: string) => void;
  /** Callback when user saves a new custom text */
  onSaveText?: (title: string, text: string) => void;
  /** Currently active tab */
  defaultTab?: TextSelectorTab;
  /** Additional CSS classes */
  className?: string;
}

/** Default sample texts for LATAM Spanish practice */
const DEFAULT_SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'sample-1',
    title: 'Common Spanish Phrases',
    text: '¿Cómo estás? ¡Hola! Buenos días. ¿Qué tal? Me llamo Juan. ¿Cuántos años tienes? Tengo veinticinco años. ¿Dónde vives? Vivo en México. ¡Mucho gusto! ¿Hablas español? Sí, hablo un poco.',
    category: 'Beginner',
    charCount: 0,
  },
  {
    id: 'sample-2',
    title: 'LATAM Special Characters',
    text: 'El niño español comió piña con jalapeño. ¿Cuánto cuesta el pingüino? ¡Qué vergüenza! La señora Muñoz habló con énfasis. El búho voló sobre el árbol. ¿Dónde está el baño? ¡Feliz cumpleaños!',
    category: 'Special Characters',
    charCount: 0,
  },
  {
    id: 'sample-3',
    title: 'Mexican Culture',
    text: 'La comida mexicana es deliciosa. ¿Has probado los tacos al pastor? El mole poblano tiene más de veinte ingredientes. ¡Qué rico está el guacamole! En México celebramos el Día de los Muertos con altares y ofrendas.',
    category: 'Culture',
    charCount: 0,
  },
  {
    id: 'sample-4',
    title: 'Numbers and Dates',
    text: '¿Cuál es tu número de teléfono? Mi cumpleaños es el veintitrés de diciembre. El año tiene trescientos sesenta y cinco días. ¿A qué hora empieza la película? A las ocho y cuarto de la noche.',
    category: 'Numbers',
    charCount: 0,
  },
  {
    id: 'sample-5',
    title: 'Questions Practice',
    text: '¿Por qué no viniste ayer? ¿Cuándo llegaste a casa? ¿Quién es tu mejor amigo? ¿Cómo se llama tu perro? ¿Dónde compraste ese vestido tan bonito? ¿Cuánto tiempo llevas estudiando español?',
    category: 'Questions',
    charCount: 0,
  },
].map((t) => ({ ...t, charCount: t.text.length }));

/**
 * Component for selecting practice text from samples, saved texts, or custom input.
 * Provides a tabbed interface with clickable cards and a modal for custom text entry.
 *
 * @example
 * <TextSelector
 *   onSelectText={(text) => startPractice(text)}
 *   savedTexts={userSavedTexts}
 *   onDeleteSaved={(id) => deleteSavedText(id)}
 *   onSaveText={(title, text) => saveNewText(title, text)}
 * />
 */
export function TextSelector({
  onSelectText,
  sampleTexts = DEFAULT_SAMPLE_TEXTS,
  savedTexts = [],
  onDeleteSaved,
  onSaveText,
  defaultTab = 'samples',
  className,
}: TextSelectorProps) {
  const [activeTab, setActiveTab] = useState<TextSelectorTab>(defaultTab);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const tabs: { id: TextSelectorTab; label: string; count?: number }[] = useMemo(
    () => [
      { id: 'samples', label: 'Sample Texts', count: sampleTexts.length },
      { id: 'saved', label: 'Saved Texts', count: savedTexts.length },
      { id: 'custom', label: 'Custom' },
    ],
    [sampleTexts.length, savedTexts.length]
  );

  const handleTabChange = useCallback((tab: TextSelectorTab) => {
    setActiveTab(tab);
    if (tab === 'custom') {
      setShowCustomModal(true);
    }
  }, []);

  const handleSelectSample = useCallback(
    (text: string) => {
      onSelectText(text);
    },
    [onSelectText]
  );

  const handleSelectSaved = useCallback(
    (text: string) => {
      onSelectText(text);
    },
    [onSelectText]
  );

  const handleCustomSubmit = useCallback(
    (text: string) => {
      onSelectText(text);
      setShowCustomModal(false);
    },
    [onSelectText]
  );

  const handleSaveText = useCallback(
    (title: string, text: string) => {
      onSaveText?.(title, text);
    },
    [onSaveText]
  );

  const handleDeleteSaved = useCallback(
    (id: string) => {
      onDeleteSaved?.(id);
      setDeleteConfirmId(null);
    },
    [onDeleteSaved]
  );

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Navigation */}
      <div className="flex border-b border-foreground/10 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium',
              'border-b-2 -mb-px',
              'transition-colors duration-150',
              'outline-none',
              'focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-inset',
              activeTab === tab.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-foreground/60 hover:text-foreground hover:border-foreground/30'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-2 px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.id
                    ? 'bg-foreground/10'
                    : 'bg-foreground/5'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Sample Texts Tab */}
        {activeTab === 'samples' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {sampleTexts.map((sample) => (
              <Card
                key={sample.id}
                variant="default"
                padding="md"
                interactive
                onClick={() => handleSelectSample(sample.text)}
                className="group cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground group-hover:text-foreground/90">
                      {sample.title}
                    </h4>
                    {sample.category && (
                      <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-foreground/10 text-foreground/70">
                        {sample.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/60 line-clamp-2">
                    {truncateText(sample.text)}
                  </p>
                  <p className="text-xs text-foreground/40">
                    {sample.charCount.toLocaleString()} characters
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Saved Texts Tab */}
        {activeTab === 'saved' && (
          <>
            {savedTexts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
                  <BookmarkIcon className="w-8 h-8 text-foreground/30" />
                </div>
                <h4 className="font-medium text-foreground mb-1">No saved texts</h4>
                <p className="text-sm text-foreground/60 mb-4 max-w-xs">
                  Save custom texts to practice with them again later
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setShowCustomModal(true)}
                >
                  Add Custom Text
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedTexts.map((saved) => (
                  <Card
                    key={saved.id}
                    variant="default"
                    padding="md"
                    className="group"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleSelectSaved(saved.text)}
                        className="flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 rounded-lg"
                      >
                        <div className="flex flex-col gap-1">
                          <h4 className="font-medium text-foreground group-hover:text-foreground/90">
                            {saved.title}
                          </h4>
                          <p className="text-sm text-foreground/60 line-clamp-2">
                            {truncateText(saved.text)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-foreground/40">
                            <span>{saved.charCount.toLocaleString()} characters</span>
                            <span>Saved {formatDate(saved.savedAt)}</span>
                          </div>
                        </div>
                      </button>

                      {onDeleteSaved && (
                        <div className="shrink-0">
                          {deleteConfirmId === saved.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteSaved(saved.id)}
                              >
                                Delete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(saved.id)}
                              className={cn(
                                'p-2 rounded-lg',
                                'text-foreground/40 hover:text-red-500',
                                'hover:bg-red-500/10',
                                'transition-colors',
                                'opacity-0 group-hover:opacity-100',
                                'focus:opacity-100',
                                'outline-none focus-visible:ring-2 focus-visible:ring-foreground/20'
                              )}
                              aria-label={`Delete "${saved.title}"`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Custom Tab - Shows button to open modal */}
        {activeTab === 'custom' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
              <EditIcon className="w-8 h-8 text-foreground/30" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Enter Custom Text</h4>
            <p className="text-sm text-foreground/60 mb-4 max-w-xs">
              Paste or type any text you want to practice with LATAM Spanish characters
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCustomModal(true)}
            >
              Enter Custom Text
            </Button>
          </div>
        )}
      </div>

      {/* Custom Text Modal */}
      <TextInputModal
        isOpen={showCustomModal}
        onClose={() => {
          setShowCustomModal(false);
          if (activeTab === 'custom') {
            setActiveTab('samples');
          }
        }}
        onSubmit={handleCustomSubmit}
        onSave={onSaveText ? handleSaveText : undefined}
      />
    </div>
  );
}

/**
 * Bookmark icon for empty state
 */
function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * Edit icon for custom text section
 */
function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/**
 * Trash icon for delete button
 */
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default TextSelector;

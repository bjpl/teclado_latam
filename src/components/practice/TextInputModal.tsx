'use client';

import {
  useState,
  useCallback,
  useId,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { cn } from '@/lib/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/** Minimum characters required for custom text */
const MIN_CHARS = 10;
/** Maximum characters allowed for custom text */
const MAX_CHARS = 5000;

export interface SaveOption {
  /** Title for the saved text */
  title: string;
  /** The text content */
  text: string;
}

export interface TextInputModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when user submits text for practice */
  onSubmit: (text: string, saveOption?: SaveOption) => void;
  /** Optional callback when user saves text for later */
  onSave?: (title: string, text: string) => void;
  /** Initial text to populate the textarea */
  initialText?: string;
}

/**
 * Modal for entering custom practice text.
 * Features a large textarea, character count validation,
 * and option to save text for later use.
 *
 * @example
 * <TextInputModal
 *   isOpen={showCustomInput}
 *   onClose={() => setShowCustomInput(false)}
 *   onSubmit={(text) => startPractice(text)}
 *   onSave={(title, text) => saveText(title, text)}
 * />
 */
export function TextInputModal({
  isOpen,
  onClose,
  onSubmit,
  onSave,
  initialText = '',
}: TextInputModalProps) {
  const [text, setText] = useState(initialText);
  const [saveForLater, setSaveForLater] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const textareaId = useId();
  const titleId = useId();
  const charCount = text.length;
  const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const canSubmit = isValidLength && (!saveForLater || saveTitle.trim().length > 0);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (newText.length > MAX_CHARS) {
      setError(`Text exceeds maximum of ${MAX_CHARS.toLocaleString()} characters`);
    } else if (newText.length > 0 && newText.length < MIN_CHARS) {
      setError(`Text must be at least ${MIN_CHARS} characters`);
    } else {
      setError(null);
    }
  }, []);

  const handleSaveToggle = useCallback(() => {
    setSaveForLater((prev) => !prev);
    if (saveForLater) {
      setSaveTitle('');
    }
  }, [saveForLater]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const trimmedText = text.trim();

    if (saveForLater && onSave) {
      onSave(saveTitle.trim(), trimmedText);
      onSubmit(trimmedText, { title: saveTitle.trim(), text: trimmedText });
    } else {
      onSubmit(trimmedText);
    }

    // Reset form
    setText('');
    setSaveForLater(false);
    setSaveTitle('');
    setError(null);
    onClose();
  }, [canSubmit, text, saveForLater, saveTitle, onSave, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    setText(initialText);
    setSaveForLater(false);
    setSaveTitle('');
    setError(null);
    onClose();
  }, [initialText, onClose]);

  const getCharCountColor = (): string => {
    if (charCount === 0) return 'text-foreground/40';
    if (charCount < MIN_CHARS) return 'text-amber-500';
    if (charCount > MAX_CHARS) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enter Custom Text"
      description="Paste or type text to practice typing with LATAM Spanish characters"
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Start Practice
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Textarea */}
        <div className="space-y-2">
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            Practice Text
          </label>
          <textarea
            id={textareaId}
            value={text}
            onChange={handleTextChange}
            placeholder="Paste or type your text here... Include special characters like: ¿ ¡ ñ á é í ó ú ü"
            rows={8}
            className={cn(
              'w-full rounded-lg resize-none',
              'bg-background text-foreground',
              'border border-foreground/20',
              'placeholder:text-foreground/40',
              'transition-colors duration-150',
              'outline-none',
              'focus:border-foreground/40',
              'focus:ring-2 focus:ring-foreground/10',
              'p-4 text-base leading-relaxed',
              error && [
                'border-red-500',
                'focus:border-red-500',
                'focus:ring-red-500/20',
              ]
            )}
            aria-invalid={!!error}
            aria-describedby={error ? 'text-error' : undefined}
          />

          {/* Character count and error */}
          <div className="flex items-center justify-between">
            <div>
              {error && (
                <p
                  id="text-error"
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
            <p className={cn('text-sm tabular-nums', getCharCountColor())}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </p>
          </div>
        </div>

        {/* Save for later option */}
        {onSave && (
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveForLater}
                onChange={handleSaveToggle}
                className={cn(
                  'w-5 h-5 rounded',
                  'bg-background border-2 border-foreground/30',
                  'checked:bg-foreground checked:border-foreground',
                  'focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background',
                  'transition-colors cursor-pointer'
                )}
              />
              <span className="text-sm text-foreground">
                Save this text for later
              </span>
            </label>

            {saveForLater && (
              <Input
                id={titleId}
                label="Title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter a title for this text"
                error={saveForLater && saveTitle.trim().length === 0 ? 'Title is required when saving' : undefined}
                fullWidth
              />
            )}
          </div>
        )}

        {/* Tips */}
        <div className="p-3 rounded-lg bg-foreground/5 border border-foreground/10">
          <p className="text-xs text-foreground/60">
            <strong className="text-foreground/80">Tip:</strong> Include LATAM Spanish special characters
            like <span className="font-mono text-foreground/80">¿ ¡ ñ á é í ó ú ü</span> for targeted practice.
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default TextInputModal;

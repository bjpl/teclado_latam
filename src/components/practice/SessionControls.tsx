/**
 * @file SessionControls.tsx
 * @description Control buttons for typing practice session.
 *
 * Features:
 * - Start/Pause/Resume button
 * - Reset button
 * - Text input/paste area (before session starts)
 * - Sample text selector dropdown
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 5 (Real-time Metrics)
 */

import { useState, useCallback, memo } from 'react';
import { Play, Pause, RotateCcw, Type, ChevronDown } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

export type SessionStatus = 'idle' | 'ready' | 'active' | 'paused' | 'completed';

export interface SessionControlsProps {
  /** Current session status */
  status: SessionStatus;
  /** Callback to start session */
  onStart?: () => void;
  /** Callback to pause session */
  onPause?: () => void;
  /** Callback to resume session */
  onResume?: () => void;
  /** Callback to reset session */
  onReset?: () => void;
  /** Callback when text is loaded */
  onLoadText?: (text: string) => void;
  /** Whether controls are disabled */
  disabled?: boolean;
}

// =============================================================================
// Sample Texts
// =============================================================================

const SAMPLE_TEXTS = [
  {
    id: 'pangram-es',
    label: 'Pangrama Espanol',
    text: 'El veloz murcielago hindu comia feliz cardillo y kiwi. La ciguena tocaba el saxofon detras del palenque de paja.',
  },
  {
    id: 'accents',
    label: 'Practicar Acentos',
    text: 'Jose compro cafe en Peru. Maria vio una pelicula fantastica. El nino pequeno jugo con su muneca.',
  },
  {
    id: 'special-chars',
    label: 'Caracteres Especiales',
    text: 'Hola! Como estas? Manana ire al cine. Que bien! El precio es $50.00 (cincuenta dolares).',
  },
  {
    id: 'numbers',
    label: 'Numeros y Simbolos',
    text: 'Los numeros del 1 al 10: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Email: usuario@correo.com',
  },
  {
    id: 'story',
    label: 'Historia Corta',
    text: 'Habia una vez un pequeno raton que vivia en una granja. Todos los dias, el raton buscaba queso en la cocina. Un dia, encontro un gran trozo de queso amarillo y lo llevo a su casa.',
  },
];

// =============================================================================
// Sub-components
// =============================================================================

interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  title?: string;
}

function ActionButton({
  onClick,
  disabled = false,
  variant = 'secondary',
  children,
  title,
}: ActionButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={title}
    >
      {children}
    </button>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * SessionControls - Control panel for typing practice
 */
function SessionControlsComponent({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onLoadText,
  disabled = false,
}: SessionControlsProps) {
  const [customText, setCustomText] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  // Handle custom text submission
  const handleLoadCustomText = useCallback(() => {
    if (customText.trim() && onLoadText) {
      onLoadText(customText.trim());
      setCustomText('');
    }
  }, [customText, onLoadText]);

  // Handle sample text selection
  const handleSelectSample = useCallback(
    (text: string) => {
      if (onLoadText) {
        onLoadText(text);
      }
      setShowSamples(false);
    },
    [onLoadText]
  );

  // Handle text paste
  const handlePaste = useCallback(
    async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && onLoadText) {
          onLoadText(text);
        }
      } catch {
        // Clipboard access denied or not available
        console.warn('Could not read from clipboard');
      }
    },
    [onLoadText]
  );

  // Render text input section (when idle)
  const renderTextInput = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="custom-text"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Enter or paste text to practice:
        </label>
        <textarea
          id="custom-text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type or paste your practice text here..."
          className="
            w-full
            min-h-[100px]
            p-3
            rounded-lg
            border
            border-gray-300
            dark:border-gray-600
            bg-white
            dark:bg-gray-800
            text-gray-900
            dark:text-gray-100
            placeholder-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            resize-y
          "
          disabled={disabled}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton
          onClick={handleLoadCustomText}
          disabled={disabled || !customText.trim()}
          variant="primary"
        >
          <Type size={18} />
          Load Text
        </ActionButton>

        <ActionButton onClick={handlePaste} disabled={disabled}>
          Paste from Clipboard
        </ActionButton>

        <div className="relative">
          <ActionButton
            onClick={() => setShowSamples(!showSamples)}
            disabled={disabled}
          >
            Sample Texts
            <ChevronDown
              size={16}
              className={`transition-transform ${showSamples ? 'rotate-180' : ''}`}
            />
          </ActionButton>

          {showSamples && (
            <div
              className="
                absolute
                top-full
                left-0
                mt-1
                w-64
                py-2
                bg-white
                dark:bg-gray-800
                rounded-lg
                shadow-lg
                border
                border-gray-200
                dark:border-gray-700
                z-10
              "
            >
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.text)}
                  className="
                    w-full
                    px-4
                    py-2
                    text-left
                    text-sm
                    text-gray-700
                    dark:text-gray-200
                    hover:bg-gray-100
                    dark:hover:bg-gray-700
                    transition-colors
                  "
                >
                  {sample.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render session controls (when ready or active)
  const renderSessionControls = () => {
    const isActive = status === 'active';
    const isPaused = status === 'paused';
    const isCompleted = status === 'completed';

    return (
      <div className="flex flex-wrap items-center gap-3">
        {/* Start/Pause/Resume button */}
        {status === 'ready' && (
          <ActionButton onClick={onStart} disabled={disabled} variant="primary">
            <Play size={18} />
            Start Typing
          </ActionButton>
        )}

        {isActive && (
          <ActionButton onClick={onPause} disabled={disabled} variant="secondary">
            <Pause size={18} />
            Pause
          </ActionButton>
        )}

        {isPaused && (
          <ActionButton onClick={onResume} disabled={disabled} variant="primary">
            <Play size={18} />
            Resume
          </ActionButton>
        )}

        {/* Reset button */}
        {(status === 'ready' ||
          isActive ||
          isPaused ||
          isCompleted) && (
          <ActionButton onClick={onReset} disabled={disabled} variant="danger">
            <RotateCcw size={18} />
            Reset
          </ActionButton>
        )}

        {/* Status indicator */}
        <span
          className={`
            px-3
            py-1
            text-sm
            font-medium
            rounded-full
            ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
            ${isPaused ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : ''}
            ${isCompleted ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
            ${status === 'ready' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : ''}
          `}
        >
          {isActive && 'Typing...'}
          {isPaused && 'Paused'}
          {isCompleted && 'Completed!'}
          {status === 'ready' && 'Ready'}
        </span>
      </div>
    );
  };

  return (
    <div className="session-controls w-full space-y-4">
      {status === 'idle' ? renderTextInput() : renderSessionControls()}

      {/* Hidden instructions for screen readers */}
      <p id="typing-instructions" className="sr-only">
        Press Tab to focus the typing area, then type the displayed text. Press
        Escape to pause, and use the control buttons to manage your session.
      </p>
    </div>
  );
}

export const SessionControls = memo(SessionControlsComponent);

export default SessionControls;

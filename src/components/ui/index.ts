/**
 * Base UI Components for Teclado LATAM
 *
 * These components follow the design system defined in the architecture:
 * - Tailwind CSS with CSS variables for theming
 * - clsx + tailwind-merge for class composition
 * - WCAG 2.1 AA accessibility compliance
 * - Dark/light mode support
 */

// Button
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Card
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
export type {
  CardProps,
  CardVariant,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './Card';

// Input
export { Input } from './Input';
export type { InputProps, InputSize } from './Input';

// Toggle
export { Toggle } from './Toggle';
export type { ToggleProps, ToggleSize } from './Toggle';

// Modal
export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

// Tooltip
export { Tooltip } from './Tooltip';
export type { TooltipProps, TooltipPosition } from './Tooltip';

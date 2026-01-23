/**
 * @file index.ts
 * @description Exports all metrics display components for Teclado LATAM.
 *
 * Components:
 * - MetricsPanel: Real-time metrics display during practice
 * - WPMDisplay: Words per minute counter with trend indicator
 * - AccuracyDisplay: Accuracy percentage with color coding
 * - TimeDisplay: Session timer in MM:SS format
 * - SessionResults: End-of-session results panel
 * - ProgressChart: Historical progress visualization
 */

// Individual metric displays
export { WPMDisplay } from './WPMDisplay';
export type { WPMDisplayProps, TrendDirection } from './WPMDisplay';

export { AccuracyDisplay } from './AccuracyDisplay';
export type { AccuracyDisplayProps, CharacterBreakdown } from './AccuracyDisplay';

export { TimeDisplay } from './TimeDisplay';
export type { TimeDisplayProps } from './TimeDisplay';

// Combined displays
export { MetricsPanel } from './MetricsPanel';
export type { MetricsPanelProps } from './MetricsPanel';

export { SessionResults } from './SessionResults';
export type { SessionResultsProps, SessionComparison } from './SessionResults';

// Visualization
export { ProgressChart } from './ProgressChart';
export type { ProgressChartProps, DataPoint } from './ProgressChart';

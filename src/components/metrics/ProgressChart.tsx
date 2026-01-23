/**
 * @file ProgressChart.tsx
 * @description Historical progress visualization using simple SVG charts.
 *
 * Displays WPM and accuracy trends over sessions without heavy charting libraries.
 * Currently a placeholder with basic SVG visualization for future expansion.
 *
 * @see docs/sparc/03-pseudocode-ui.md Section 6 (Results Screen Generation)
 */

'use client';

import { useMemo } from 'react';

export interface DataPoint {
  /** Session identifier or date */
  label: string;
  /** WPM value */
  wpm: number;
  /** Accuracy value (0-100) */
  accuracy: number;
  /** Optional timestamp */
  timestamp?: number;
}

export interface ProgressChartProps {
  /** Data points to display */
  data: DataPoint[];
  /** Chart height in pixels */
  height?: number;
  /** Which metric to display */
  metric?: 'wpm' | 'accuracy' | 'both';
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Whether to show data point dots */
  showDots?: boolean;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate chart dimensions and scales
 */
function useChartDimensions(
  data: DataPoint[],
  height: number,
  metric: 'wpm' | 'accuracy' | 'both'
) {
  return useMemo(() => {
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 400; // Base width, will be responsive via viewBox

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate scales
    const wpmValues = data.map(d => d.wpm);
    const accuracyValues = data.map(d => d.accuracy);

    const wpmMin = Math.max(0, Math.min(...wpmValues) - 5);
    const wpmMax = Math.max(...wpmValues) + 5;
    const accuracyMin = Math.max(0, Math.min(...accuracyValues) - 5);
    const accuracyMax = Math.min(100, Math.max(...accuracyValues) + 5);

    const xScale = (index: number) =>
      padding.left + (index / Math.max(1, data.length - 1)) * chartWidth;

    const wpmYScale = (value: number) =>
      padding.top + chartHeight - ((value - wpmMin) / (wpmMax - wpmMin)) * chartHeight;

    const accuracyYScale = (value: number) =>
      padding.top + chartHeight - ((value - accuracyMin) / (accuracyMax - accuracyMin)) * chartHeight;

    return {
      width,
      height,
      chartWidth,
      chartHeight,
      padding,
      wpmMin,
      wpmMax,
      accuracyMin,
      accuracyMax,
      xScale,
      wpmYScale,
      accuracyYScale,
    };
  }, [data, height, metric]);
}

/**
 * Generate SVG path for a line
 */
function generateLinePath(
  data: DataPoint[],
  xScale: (i: number) => number,
  yScale: (v: number) => number,
  getValue: (d: DataPoint) => number
): string {
  if (data.length === 0) return '';

  const points = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(getValue(d)),
  }));

  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

/**
 * Grid lines component
 */
function GridLines({
  dims,
  showGrid,
}: {
  dims: ReturnType<typeof useChartDimensions>;
  showGrid: boolean;
}) {
  if (!showGrid) return null;

  const horizontalLines = 5;
  const verticalLines = Math.min(10, dims.chartWidth / 40);

  return (
    <g className="grid-lines" opacity={0.2}>
      {/* Horizontal grid lines */}
      {Array.from({ length: horizontalLines + 1 }).map((_, i) => {
        const y = dims.padding.top + (i / horizontalLines) * dims.chartHeight;
        return (
          <line
            key={`h-${i}`}
            x1={dims.padding.left}
            y1={y}
            x2={dims.padding.left + dims.chartWidth}
            y2={y}
            stroke="currentColor"
            strokeDasharray="2,2"
          />
        );
      })}
      {/* Vertical grid lines */}
      {Array.from({ length: Math.floor(verticalLines) + 1 }).map((_, i) => {
        const x = dims.padding.left + (i / verticalLines) * dims.chartWidth;
        return (
          <line
            key={`v-${i}`}
            x1={x}
            y1={dims.padding.top}
            x2={x}
            y2={dims.padding.top + dims.chartHeight}
            stroke="currentColor"
            strokeDasharray="2,2"
          />
        );
      })}
    </g>
  );
}

/**
 * Data line component
 */
function DataLine({
  data,
  dims,
  metric,
  color,
  showDots,
}: {
  data: DataPoint[];
  dims: ReturnType<typeof useChartDimensions>;
  metric: 'wpm' | 'accuracy';
  color: string;
  showDots: boolean;
}) {
  const yScale = metric === 'wpm' ? dims.wpmYScale : dims.accuracyYScale;
  const getValue = (d: DataPoint) => (metric === 'wpm' ? d.wpm : d.accuracy);

  const path = generateLinePath(data, dims.xScale, yScale, getValue);

  return (
    <g className={`data-line-${metric}`}>
      {/* Area fill */}
      <path
        d={`${path} L ${dims.xScale(data.length - 1)} ${dims.padding.top + dims.chartHeight} L ${dims.padding.left} ${dims.padding.top + dims.chartHeight} Z`}
        fill={color}
        opacity={0.1}
      />
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {showDots &&
        data.map((d, i) => (
          <circle
            key={i}
            cx={dims.xScale(i)}
            cy={yScale(getValue(d))}
            r={4}
            fill="white"
            stroke={color}
            strokeWidth={2}
          />
        ))}
    </g>
  );
}

/**
 * Y-axis labels component
 */
function YAxisLabels({
  dims,
  metric,
}: {
  dims: ReturnType<typeof useChartDimensions>;
  metric: 'wpm' | 'accuracy' | 'both';
}) {
  const tickCount = 5;

  const minVal = metric === 'accuracy' ? dims.accuracyMin : dims.wpmMin;
  const maxVal = metric === 'accuracy' ? dims.accuracyMax : dims.wpmMax;
  const suffix = metric === 'accuracy' ? '%' : '';

  return (
    <g className="y-axis-labels">
      {Array.from({ length: tickCount + 1 }).map((_, i) => {
        const y = dims.padding.top + (i / tickCount) * dims.chartHeight;
        const value = maxVal - ((maxVal - minVal) * i) / tickCount;
        return (
          <text
            key={i}
            x={dims.padding.left - 8}
            y={y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-500 dark:fill-gray-400"
          >
            {Math.round(value)}{suffix}
          </text>
        );
      })}
    </g>
  );
}

/**
 * ProgressChart - Historical progress visualization
 *
 * Features:
 * - Line chart showing WPM and/or accuracy over sessions
 * - Simple SVG-based rendering (no heavy dependencies)
 * - Optional grid lines and data point dots
 * - Responsive via viewBox
 * - Dark/light mode support
 */
export function ProgressChart({
  data,
  height = 200,
  metric = 'wpm',
  showGrid = true,
  showDots = true,
  showLabels = true,
  className = '',
}: ProgressChartProps) {
  const dims = useChartDimensions(data, height, metric);

  // Handle empty data
  if (data.length === 0) {
    return (
      <div
        className={`
          flex items-center justify-center
          h-[${height}px]
          bg-gray-50 dark:bg-gray-800/50
          rounded-lg border border-gray-200 dark:border-gray-700
          ${className}
        `}
      >
        <p className="text-gray-500 dark:text-gray-400">
          No session data yet. Complete a session to see your progress!
        </p>
      </div>
    );
  }

  // Handle single data point
  if (data.length === 1) {
    return (
      <div
        className={`
          flex flex-col items-center justify-center gap-2
          h-[${height}px]
          bg-gray-50 dark:bg-gray-800/50
          rounded-lg border border-gray-200 dark:border-gray-700
          ${className}
        `}
      >
        <p className="text-gray-500 dark:text-gray-400">
          First session recorded!
        </p>
        <div className="flex gap-4 text-lg font-medium">
          {(metric === 'wpm' || metric === 'both') && (
            <span className="text-blue-600 dark:text-blue-400">
              {data[0].wpm.toFixed(1)} WPM
            </span>
          )}
          {(metric === 'accuracy' || metric === 'both') && (
            <span className="text-green-600 dark:text-green-400">
              {data[0].accuracy.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white dark:bg-gray-900
        rounded-lg border border-gray-200 dark:border-gray-700
        p-4
        ${className}
      `}
      role="img"
      aria-label={`Progress chart showing ${metric} over ${data.length} sessions`}
    >
      {/* Legend */}
      {metric === 'both' && (
        <div className="flex justify-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">WPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {/* Grid */}
        <GridLines dims={dims} showGrid={showGrid} />

        {/* Y-axis labels */}
        {showLabels && <YAxisLabels dims={dims} metric={metric === 'both' ? 'wpm' : metric} />}

        {/* Data lines */}
        {(metric === 'wpm' || metric === 'both') && (
          <DataLine
            data={data}
            dims={dims}
            metric="wpm"
            color="#3b82f6"
            showDots={showDots}
          />
        )}
        {(metric === 'accuracy' || metric === 'both') && (
          <DataLine
            data={data}
            dims={dims}
            metric="accuracy"
            color="#22c55e"
            showDots={showDots}
          />
        )}

        {/* X-axis labels */}
        {showLabels && data.length <= 10 && (
          <g className="x-axis-labels">
            {data.map((d, i) => (
              <text
                key={i}
                x={dims.xScale(i)}
                y={dims.padding.top + dims.chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                {d.label}
              </text>
            ))}
          </g>
        )}
      </svg>

      {/* Summary stats */}
      <div className="mt-4 flex justify-center gap-8 text-sm">
        {(metric === 'wpm' || metric === 'both') && (
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">Avg WPM</div>
            <div className="font-medium text-blue-600 dark:text-blue-400">
              {(data.reduce((sum, d) => sum + d.wpm, 0) / data.length).toFixed(1)}
            </div>
          </div>
        )}
        {(metric === 'accuracy' || metric === 'both') && (
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">Avg Accuracy</div>
            <div className="font-medium text-green-600 dark:text-green-400">
              {(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length).toFixed(1)}%
            </div>
          </div>
        )}
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">Sessions</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {data.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;

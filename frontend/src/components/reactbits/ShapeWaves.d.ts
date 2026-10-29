import type { CSSProperties, HTMLAttributes } from "react";

export type ShapeWavesShapes = "mixed" | "squares" | "circles" | "triangles";

export type ShapeWavesProps = HTMLAttributes<HTMLDivElement> & {
  readonly text?: string;
  readonly fontFamily?: string;
  readonly fontWeight?: number | string;
  readonly textSize?: number;
  readonly shapes?: ShapeWavesShapes;
  readonly cellSize?: number;
  readonly dotSize?: number;
  readonly color?: string;
  readonly hoverColor?: string;
  readonly backgroundColor?: string;
  readonly speed?: number;
  readonly scale?: number;
  readonly contrast?: number;
  readonly brightness?: number;
  readonly flow?: number;
  readonly direction?: number;
  readonly fade?: number;
  readonly interactive?: boolean;
  readonly splashRadius?: number;
  readonly splashStrength?: number;
  readonly glow?: number;
  readonly intro?: boolean;
  readonly introDuration?: number;
  readonly introKey?: number;
  readonly paused?: boolean;
  readonly onError?: (error: Error) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
};

declare const ShapeWaves: (props: ShapeWavesProps) => JSX.Element;

export default ShapeWaves;

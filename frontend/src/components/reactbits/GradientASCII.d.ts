import type { CSSProperties, HTMLAttributes } from "react";

export type GradientAsciiShape = "horizon" | "pinch" | "rise" | "eclipse";

export type GradientAsciiClickEffect = "none" | "wave" | "burst";

export type GradientAsciiProps = HTMLAttributes<HTMLDivElement> & {
  readonly colors?: string[];
  readonly shape?: GradientAsciiShape;
  readonly characters?: string;
  readonly cellSize?: number;
  readonly density?: number;
  readonly glyphOpacity?: number;
  readonly glow?: number;
  readonly depthOfField?: number;
  readonly flicker?: number;
  readonly softness?: number;
  readonly scale?: number;
  readonly flow?: number;
  readonly speed?: number;
  readonly gradientOpacity?: number;
  readonly grain?: number;
  readonly variation?: number;
  readonly mouseInteraction?: boolean;
  readonly scrambleRadius?: number;
  readonly clickEffect?: GradientAsciiClickEffect;
  readonly intro?: boolean;
  readonly lightMode?: boolean;
  readonly fontFamily?: string;
  readonly dpr?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
};

declare const GradientASCII: (props: GradientAsciiProps) => JSX.Element;

export default GradientASCII;

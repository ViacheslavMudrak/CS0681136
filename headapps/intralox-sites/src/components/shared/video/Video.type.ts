export interface BrightcovePlayer {
  muted(value: boolean): void;
  play(): void;
  controls(value: boolean): void;
  loop(value: boolean): void;
  pause(): void;
  on(event: string, handler: () => void): void;
}

export interface VideoMarkupProps {
  attrs?: Record<string, boolean | number | string | undefined>;
  videoId: string;
  onSuccess?: (success: { type: string; ref: unknown }) => void;
}
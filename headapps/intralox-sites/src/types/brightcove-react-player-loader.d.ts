declare module "@brightcove/react-player-loader" {
  import type { ComponentType } from "react";

  interface ReactPlayerLoaderProps {
    accountId: string;
    playerId: string;
    videoId: string;
    attrs?: Record<string, string>;
    onSuccess?: (success: { type: string; ref: unknown }) => void;
    options?: Record<string, boolean | number | string | undefined>;
  }

  const ReactPlayerLoader: ComponentType<ReactPlayerLoaderProps>;
  export default ReactPlayerLoader;
}

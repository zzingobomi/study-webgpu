export type CanvasConfig = {
  canvas?: HTMLCanvasElement;
  /**
   * wheter use transparent background
   * To set a transparent background, the SkyRenderer{@link SkyRenderer} component should be disabled
   * skyRender.enable = false
   */
  alpha?: boolean;
  zIndex?: number;
  devicePixelRatio?: number;
  backgroundImage?: string;
};

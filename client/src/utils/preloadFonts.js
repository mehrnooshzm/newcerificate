// Preloads a list of fonts to ensure they are available before rendering on canvas
export const preloadFonts = (fonts = []) => {
  fonts.forEach((font) => {
    document.fonts.load(`1em ${font}`).catch((err) => {
      console.warn(`Failed to preload font: ${font}`, err);
    });
  });
};

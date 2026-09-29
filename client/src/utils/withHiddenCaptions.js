// Temporarily hide captions
const withHiddenCaptions = async (canvas, callback) => {
  if (!canvas) return;

  // Store captions for restoring visibility later
  const captionsToRestore = [];

  // Hide captions
  canvas.getObjects().forEach((obj) => {
    if (obj.type === 'custom-group') {
      const caption = obj.getObjects().find((child) => child.type === 'i-text');

      if (caption) {
        captionsToRestore.push(caption);
        caption.visible = false;
      }
    }
  });

  // Run the callback
  await callback();

  // Restore captions
  captionsToRestore.forEach((caption) => (caption.visible = true));
};

export default withHiddenCaptions;

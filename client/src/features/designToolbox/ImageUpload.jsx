import { useRef } from 'react';
import { FabricImage } from 'fabric';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { Upload } from 'lucide-react';
import { supabase } from '@/supabase/supabase';

const ImageUpload = () => {
  const { canvasEditor } = useCanvasContext();
  const fileInputRef = useRef(null);

  // Handle image selection and upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file || !canvasEditor) return;

    const fileName = `${Date.now()}-${file.name}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
    }

    // Get public URL of uploaded image
    const { data: url } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(fileName);

    // Load image into Fabric canvas
    const canvasImageRef = await FabricImage.fromURL(url.publicUrl, {
      crossOrigin: 'anonymous',
    });

    // Scale image to fit canvas while maintaining aspect ratio.
    //
    // IMPORTANT: canvasEditor.width/height are the canvas element's actual
    // rendered pixel dimensions — fitCanvasToContainer() shrinks these to
    // fit the viewport (e.g. on mobile) and compensates with canvas zoom.
    // They do NOT match the coordinate space Fabric objects are placed in.
    // The logical page size — the space object.left/top/scaleX/scaleY
    // actually live in — is canvasEditor._pageWidth/_pageHeight (set by
    // applyPageSettings). Using the wrong one here sizes/positions the
    // image based on the on-screen zoomed size instead of the real page,
    // so it ends up mis-scaled the moment the two differ (any container
    // size other than 1:1, not even an orientation change).
    const pageWidth = canvasEditor._pageWidth ?? canvasEditor.width;
    const pageHeight = canvasEditor._pageHeight ?? canvasEditor.height;

    const scaleFactor = Math.min(
      (pageWidth * 0.7) / canvasImageRef.width,
      (pageHeight * 0.7) / canvasImageRef.height
    );

    canvasImageRef.scale(scaleFactor);
    canvasImageRef.set({
      left: (pageWidth - canvasImageRef.width * scaleFactor) / 2,
      top: (pageHeight - canvasImageRef.height * scaleFactor) / 2,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    // Add image to canvas. (CanvasEditor's object:added listener registers
    // its canonical baseline, same as every other object type.)
    canvasEditor.add(canvasImageRef);
    canvasEditor.renderAll();
  };

  return (
    <div className='space-y-4'>
      {/* Upload button with icon */}
      <div className='flex flex-col items-center p-1   cursor-pointer'>
        <Upload className='w-8 h-8 mb-2 text-gray-400' />
        <label className='px-3 py-1 rounded bg-[var(--secondary-color)] hover:bg-[var(--tertiary-color)] hover:text-black text-white text-xs cursor-pointer transition-colors'>
          Select Image
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleImageUpload}
            className='hidden'
          />
        </label>
        <p className='text-xs text-gray-400 mt-2 text-center'>
          JPG, PNG or SVG files
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;

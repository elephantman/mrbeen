import { toPng, toBlob } from 'html-to-image';

export interface ExportResult {
  success: boolean;
  error?: string;
}

export const downloadElementAsPNG = async (
  element: HTMLElement,
  fileName: string = 'been-travel-map.png',
  pixelRatio: number = 2
): Promise<ExportResult> => {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio,
      cacheBust: true,
      backgroundColor: '#090d16',
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
    return { success: true };
  } catch (err: unknown) {
    console.error('Failed to export PNG:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Export failed' };
  }
};

export const shareElementAsImage = async (
  element: HTMLElement,
  title: string = 'My Travel Map',
  text: string = 'Check out my visited countries and cities!'
): Promise<ExportResult> => {
  try {
    const blob = await toBlob(element, {
      quality: 0.95,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#090d16',
    });

    if (!blob) {
      throw new Error('Could not generate image blob');
    }

    const file = new File([blob], 'my-travel-map.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return { success: true };
    } else if (navigator.share) {
      await navigator.share({
        title,
        text,
        url: window.location.href,
      });
      return { success: true };
    } else {
      // Fallback to direct download
      return await downloadElementAsPNG(element, 'my-travel-map.png');
    }
  } catch (err: unknown) {
    console.error('Failed to share image:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Share failed' };
  }
};

export const copyElementImageToClipboard = async (
  element: HTMLElement
): Promise<ExportResult> => {
  try {
    const blob = await toBlob(element, {
      quality: 0.95,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#090d16',
    });

    if (!blob) throw new Error('Failed to create image blob');

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);

    return { success: true };
  } catch (err: unknown) {
    console.error('Clipboard copy failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Copy failed' };
  }
};

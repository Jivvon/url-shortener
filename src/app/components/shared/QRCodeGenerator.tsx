import { useRef, useCallback } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Button } from '../ui';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  showDownload?: boolean;
}

export default function QRCodeGenerator({
  url,
  size = 200,
  showDownload = true,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, []);

  const downloadSVG = useCallback(() => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Visible SVG QR Code */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <QRCodeSVG
          id="qr-code-svg"
          value={url}
          size={size}
          level="M"
          marginSize={2}
        />
      </div>

      {/* Hidden Canvas for PNG download */}
      <div ref={canvasRef} className="hidden">
        <QRCodeCanvas
          value={url}
          size={size * 2} // Higher resolution for download
          level="M"
          marginSize={2}
        />
      </div>

      {showDownload && (
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={downloadPNG}>
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={downloadSVG}>
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            SVG
          </Button>
        </div>
      )}
    </div>
  );
}

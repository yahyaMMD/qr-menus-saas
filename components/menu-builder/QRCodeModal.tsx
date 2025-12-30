'use client';

import { X, Download, Printer, Copy, Check, Loader2 } from 'lucide-react';
import { MenuData } from './types';

interface QRCodeModalProps {
  menu: MenuData | null;
  qrCodeSvg: string;
  isLoadingQR: boolean;
  copied: boolean;
  onClose: () => void;
  onCopyURL: () => void;
  onDownloadQR: (format: 'svg' | 'png') => void;
  onPrintQR: () => void;
  getPublicMenuUrl: () => string;
}

export function QRCodeModal({
  menu,
  qrCodeSvg,
  isLoadingQR,
  copied,
  onClose,
  onCopyURL,
  onDownloadQR,
  onPrintQR,
  getPublicMenuUrl,
}: QRCodeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">QR Code</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isLoadingQR ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-8 mb-6 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-2">Menu URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-blue-200 overflow-x-auto">
                  {getPublicMenuUrl()}
                </code>
                <button
                  onClick={onCopyURL}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  {copied ? <><Check className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => onDownloadQR('svg')} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                <Download className="w-5 h-5" />SVG
              </button>
              <button onClick={() => onDownloadQR('png')} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                <Download className="w-5 h-5" />PNG
              </button>
              <button onClick={onPrintQR} className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                <Printer className="w-5 h-5" />Print
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


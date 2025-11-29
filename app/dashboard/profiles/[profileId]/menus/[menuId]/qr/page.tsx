'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Printer, QrCode, ArrowLeft, Copy, Check } from 'lucide-react';

export default function MenuQRCodePage() {
  const params = useParams();
  const router = useRouter();
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [size, setSize] = useState(300);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQRCode();
  }, [params.menuId]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/qr/${params.menuId}?format=svg&size=${size}`);
      
      if (!response.ok) throw new Error('Failed to generate QR code');
      
      const svg = await response.text();
      setQrCodeSvg(svg);
      
      // Extract menu URL from response headers or construct it
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/menu/${params.profileId}?menuId=${params.menuId}`;
      setMenuUrl(url);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setLoading(false);
    }
  };

  const handleDownload = async (downloadFormat: 'svg' | 'png') => {
    try {
      const response = await fetch(`/api/qr/${params.menuId}?format=${downloadFormat}&size=${size}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-qr-code.${downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download QR code');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Menu QR Code</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .print-container {
                text-align: center;
                padding: 40px;
              }
              .qr-code {
                margin: 20px 0;
              }
              .instructions {
                margin-top: 30px;
                font-size: 18px;
                color: #333;
              }
              @media print {
                body {
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>Scan to View Menu</h1>
              <div class="qr-code">${qrCodeSvg}</div>
              <div class="instructions">
                <p><strong>How to use:</strong></p>
                <p>1. Point your phone camera at the QR code</p>
                <p>2. Tap the notification to open the menu</p>
                <p>3. Browse our delicious offerings!</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <QrCode className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-900">Menu QR Code</h1>
        </div>
        <p className="text-gray-600">Download or print your QR code for customers to scan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        {/* QR Code Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">QR Code Preview</h2>
          
          <div 
            ref={qrRef}
            className="bg-white p-8 rounded-xl border-4 border-gray-200 flex items-center justify-center mb-6"
            dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
          />

          {/* Size Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              QR Code Size: {size}px
            </label>
            <input
              type="range"
              min="200"
              max="500"
              step="50"
              value={size}
              onChange={(e) => {
                setSize(parseInt(e.target.value));
                fetchQRCode();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>

          {/* Menu URL */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={menuUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={handleCopyUrl}
                className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                title="Copy URL"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-teal-600 mt-2">✓ Copied to clipboard!</p>
            )}
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-6">
          {/* Download Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Download Options</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleDownload('svg')}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Download className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Download SVG</div>
                    <div className="text-sm text-gray-500">Vector format, scalable to any size</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Download →
                </div>
              </button>

              <button
                onClick={() => handleDownload('png')}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Download PNG</div>
                    <div className="text-sm text-gray-500">Image format, ready for printing</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Download →
                </div>
              </button>

              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Printer className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Print QR Code</div>
                    <div className="text-sm text-gray-500">Print directly or save as PDF</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Print →
                </div>
              </button>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white">
            <h3 className="text-xl font-semibold mb-4">💡 Tips for Best Results</h3>
            <ul className="space-y-3 text-teal-50">
              <li className="flex items-start gap-2">
                <span className="text-teal-200 mt-1">•</span>
                <span>Print on high-quality paper for better scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-200 mt-1">•</span>
                <span>Place QR codes at eye level on tables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-200 mt-1">•</span>
                <span>Ensure good lighting for easy scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-200 mt-1">•</span>
                <span>Test the QR code before displaying to customers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-200 mt-1">•</span>
                <span>Include "Scan for Menu" text near the QR code</span>
              </li>
            </ul>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Scans Today</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Total Scans</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
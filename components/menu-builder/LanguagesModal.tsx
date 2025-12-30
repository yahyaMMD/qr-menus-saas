'use client';

import { useState, useEffect } from 'react';
import { X, Languages, Loader2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { MenuData } from './types';

interface LanguagesModalProps {
  menu: MenuData | null;
  saving: boolean;
  onClose: () => void;
  onSave: (defaultLang: string, supportedLangs: string[]) => void;
}

export function LanguagesModal({ menu, saving, onClose, onSave }: LanguagesModalProps) {
  const [selectedDefault, setSelectedDefault] = useState(menu?.defaultLanguage || 'en');
  const [selectedSupported, setSelectedSupported] = useState<string[]>(menu?.supportedLanguages || ['en']);

  useEffect(() => {
    if (menu) {
      setSelectedDefault(menu.defaultLanguage || 'en');
      setSelectedSupported(menu.supportedLanguages || ['en']);
    }
  }, [menu]);

  const toggleLanguage = (code: string) => {
    if (selectedSupported.includes(code)) {
      if (selectedSupported.length > 1) {
        const newSupported = selectedSupported.filter(c => c !== code);
        setSelectedSupported(newSupported);
        if (selectedDefault === code) {
          setSelectedDefault(newSupported[0]);
        }
      }
    } else {
      setSelectedSupported([...selectedSupported, code]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Menu Languages</h3>
              <p className="text-sm text-gray-500">Configure multilingual support for international visitors</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Default Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Default Language</label>
            <p className="text-xs text-gray-500 mb-3">This is the primary language for your menu content</p>
            <select
              value={selectedDefault}
              onChange={(e) => {
                setSelectedDefault(e.target.value);
                if (!selectedSupported.includes(e.target.value)) {
                  setSelectedSupported([...selectedSupported, e.target.value]);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Supported Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Supported Languages</label>
            <p className="text-xs text-gray-500 mb-3">Select languages your menu will be available in</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPORTED_LANGUAGES.map(lang => {
                const isSelected = selectedSupported.includes(lang.code);
                const isDefault = selectedDefault === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    disabled={isDefault}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                      } ${isDefault ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{lang.nativeName}</p>
                        <p className="text-xs text-gray-500">{lang.name}</p>
                      </div>
                      {isDefault && (
                        <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Default</span>
                      )}
                      {isSelected && !isDefault && (
                        <span className="ml-auto text-orange-500">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> After adding languages, click the translate icon (🌐) on items and categories to add translations.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedDefault, selectedSupported)}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Languages
          </button>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { X, Globe, Check, Loader2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { MenuData, Translation } from './types';

interface TranslationModalProps {
  menu: MenuData | null;
  translatingEntity: { type: string; id: string; name: string } | null;
  translations: Translation[];
  onClose: () => void;
  onShowLanguagesModal: () => void;
  onSaveTranslation: (entityType: string, entityId: string, languageCode: string, field: string, value: string) => Promise<boolean>;
  getTranslation: (entityType: string, entityId: string, languageCode: string, field: string) => string;
}

export function TranslationModal({
  menu,
  translatingEntity,
  translations,
  onClose,
  onShowLanguagesModal,
  onSaveTranslation,
  getTranslation,
}: TranslationModalProps) {
  const [localTranslations, setLocalTranslations] = useState<Record<string, Record<string, string>>>({});
  const [savingField, setSavingField] = useState<string | null>(null);

  const supportedLangs = menu?.supportedLanguages?.filter(l => l !== menu?.defaultLanguage) || [];
  const fields = translatingEntity?.type === 'item' ? ['name', 'description'] : ['name'];

  useEffect(() => {
    if (translatingEntity) {
      const initial: Record<string, Record<string, string>> = {};
      supportedLangs.forEach(lang => {
        initial[lang] = {};
        fields.forEach(field => {
          initial[lang][field] = getTranslation(translatingEntity.type, translatingEntity.id, lang, field);
        });
      });
      setLocalTranslations(initial);
    }
  }, [translatingEntity, supportedLangs, fields, getTranslation]);

  const handleSave = async (lang: string, field: string) => {
    if (!translatingEntity) return;
    setSavingField(`${lang}-${field}`);
    const value = localTranslations[lang]?.[field] || '';
    await onSaveTranslation(translatingEntity.type, translatingEntity.id, lang, field, value);
    setSavingField(null);
  };

  if (!translatingEntity || supportedLangs.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Languages Configured</h3>
          <p className="text-gray-500 mb-4">Add more languages in Language Settings first.</p>
          <button
            onClick={() => { onClose(); onShowLanguagesModal(); }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Configure Languages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Translate: {translatingEntity.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{translatingEntity.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {supportedLangs.map(langCode => {
            const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
            if (!lang) return null;

            return (
              <div key={langCode} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium text-gray-900">{lang.nativeName}</span>
                  <span className="text-gray-500 text-sm">({lang.name})</span>
                </div>
                <div className="p-4 space-y-4">
                  {fields.map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
                      {field === 'description' ? (
                        <textarea
                          rows={2}
                          value={localTranslations[langCode]?.[field] || ''}
                          onChange={(e) => setLocalTranslations(prev => ({
                            ...prev,
                            [langCode]: { ...prev[langCode], [field]: e.target.value }
                          }))}
                          placeholder={`Enter ${field} in ${lang.name}...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          dir={lang.direction}
                        />
                      ) : (
                        <input
                          type="text"
                          value={localTranslations[langCode]?.[field] || ''}
                          onChange={(e) => setLocalTranslations(prev => ({
                            ...prev,
                            [langCode]: { ...prev[langCode], [field]: e.target.value }
                          }))}
                          placeholder={`Enter ${field} in ${lang.name}...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          dir={lang.direction}
                        />
                      )}
                      <button
                        onClick={() => handleSave(langCode, field)}
                        disabled={savingField === `${langCode}-${field}`}
                        className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {savingField === `${langCode}-${field}` ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
                        ) : (
                          <><Check className="w-3 h-3" /> Save</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}


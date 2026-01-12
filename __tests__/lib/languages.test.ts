import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  getLanguageName,
  getLanguageFlag,
  isRTL,
} from '@/lib/languages';

describe('Language utilities', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should have English as default language', () => {
      const english = SUPPORTED_LANGUAGES.find(lang => lang.code === 'en');
      expect(english).toBeDefined();
      expect(english?.name).toBe('English');
      expect(english?.direction).toBe('ltr');
    });

    it('should include Arabic with RTL direction', () => {
      const arabic = SUPPORTED_LANGUAGES.find(lang => lang.code === 'ar');
      expect(arabic).toBeDefined();
      expect(arabic?.direction).toBe('rtl');
    });
  });

  describe('getLanguageByCode', () => {
    it('should return language for valid code', () => {
      const lang = getLanguageByCode('en');
      expect(lang).toBeDefined();
      expect(lang?.code).toBe('en');
    });

    it('should return undefined for invalid code', () => {
      const lang = getLanguageByCode('xx');
      expect(lang).toBeUndefined();
    });
  });

  describe('getLanguageName', () => {
    it('should return language name for valid code', () => {
      expect(getLanguageName('en')).toBe('English');
      expect(getLanguageName('fr')).toBe('French');
    });

    it('should return code for invalid code', () => {
      expect(getLanguageName('xx')).toBe('xx');
    });
  });

  describe('getLanguageFlag', () => {
    it('should return flag emoji for valid code', () => {
      const flag = getLanguageFlag('en');
      expect(flag).toBeTruthy();
      expect(typeof flag).toBe('string');
    });

    it('should return default flag for invalid code', () => {
      expect(getLanguageFlag('xx')).toBe('🌐');
    });
  });

  describe('isRTL', () => {
    it('should return true for RTL languages', () => {
      expect(isRTL('ar')).toBe(true);
    });

    it('should return false for LTR languages', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('fr')).toBe(false);
    });

    it('should return false for invalid code', () => {
      expect(isRTL('xx')).toBe(false);
    });
  });
});


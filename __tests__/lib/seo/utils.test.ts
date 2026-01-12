import {
  generateMetadata,
  generateStructuredData,
  generateOrganizationSchema,
  generateRestaurantSchema,
  generateMenuSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/utils';

describe('SEO utilities', () => {
  describe('generateMetadata', () => {
    it('should generate metadata with required fields', () => {
      const metadata = generateMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.title).toBe('Test Page | QResto');
      expect(metadata.description).toBe('Test description');
    });

    it('should not duplicate QResto in title', () => {
      const metadata = generateMetadata({
        title: 'QResto Home',
        description: 'Test',
      });

      expect(metadata.title).toBe('QResto Home');
    });

    it('should include keywords when provided', () => {
      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
        keywords: ['test', 'keyword'],
      });

      expect(metadata.keywords).toEqual(['test', 'keyword']);
    });

    it('should generate OpenGraph metadata', () => {
      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
        url: '/test',
      });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe('Test | QResto');
      expect(metadata.openGraph?.url).toContain('/test');
      expect(metadata.openGraph?.siteName).toBe('QResto');
    });

    it('should generate Twitter card metadata', () => {
      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
      });

      expect(metadata.twitter).toBeDefined();
      const twitter = metadata.twitter;
      if (twitter && typeof twitter === 'object' && 'card' in twitter) {
        expect(twitter.card).toBe('summary_large_image');
        expect(twitter.creator).toBe('@qresto');
      } else {
        fail('Expected twitter to be an object with card property');
      }
    });

    it('should handle noindex and nofollow', () => {
      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
        noindex: true,
        nofollow: true,
      });

      const robots = metadata.robots;
      if (robots && typeof robots === 'object') {
        expect(robots.index).toBe(false);
        expect(robots.follow).toBe(false);
      } else {
        fail('Expected robots to be an object');
      }
    });
  });

  describe('generateStructuredData', () => {
    it('should generate structured data with correct context and type', () => {
      const data = generateStructuredData({
        type: 'Organization',
        data: { name: 'Test Org' },
      });

      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('Organization');
      expect(data.name).toBe('Test Org');
    });
  });

  describe('generateOrganizationSchema', () => {
    it('should generate organization schema', () => {
      const schema = generateOrganizationSchema();

      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('QResto');
      expect(schema.contactPoint).toBeDefined();
      expect(schema.contactPoint['@type']).toBe('ContactPoint');
    });
  });

  describe('generateRestaurantSchema', () => {
    it('should generate restaurant schema with all fields', () => {
      const schema = generateRestaurantSchema({
        name: 'Test Restaurant',
        description: 'A test restaurant',
        address: '123 Test St',
        phone: '+1234567890',
        website: 'https://test.com',
        image: 'https://test.com/image.jpg',
      });

      expect(schema['@type']).toBe('Restaurant');
      expect(schema.name).toBe('Test Restaurant');
      expect(schema.description).toBe('A test restaurant');
      expect(schema.address).toBeDefined();
      expect(schema.telephone).toBe('+1234567890');
      expect(schema.url).toBe('https://test.com');
    });

    it('should handle optional fields', () => {
      const schema = generateRestaurantSchema({
        name: 'Test Restaurant',
      });

      expect(schema.name).toBe('Test Restaurant');
      expect(schema.description).toContain('Test Restaurant');
      expect(schema.address).toBeUndefined();
    });
  });

  describe('generateMenuSchema', () => {
    it('should generate menu schema with items', () => {
      const schema = generateMenuSchema({
        name: 'Test Menu',
        description: 'A test menu',
        restaurantName: 'Test Restaurant',
        items: [
          { name: 'Item 1', description: 'Desc 1', price: 10, image: 'img1.jpg' },
          { name: 'Item 2', price: 20 },
        ],
      });

      expect(schema['@type']).toBe('Menu');
      expect(schema.name).toBe('Test Menu');
      expect(schema.provider.name).toBe('Test Restaurant');
      expect(schema.hasMenuSection).toHaveLength(2);
      expect(schema.hasMenuSection[0].name).toBe('Item 1');
      expect(schema.hasMenuSection[0].offers.price).toBe(10);
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate breadcrumb schema', () => {
      const schema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Menu', url: '/menu' },
      ]);

      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
    });
  });
});


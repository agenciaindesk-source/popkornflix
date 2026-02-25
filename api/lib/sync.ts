import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  slug: string;
  type: 'movie' | 'series';
  posterUrl: string;
  year?: number;
  description?: string;
}

export class PopkornScraper {
  private baseUrl = 'https://net52.cc';

  async fetchLatest(): Promise<ScrapedContent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/latest`);
      const html = await response.text();
      const $ = cheerio.load(html);
      const results: ScrapedContent[] = [];

      $('.movie-item').each((_, el) => {
        const title = $(el).find('.title').text().trim();
        const href = $(el).find('a').attr('href') || '';
        const slug = href.split('/').pop() || '';
        const posterUrl = $(el).find('img').attr('src') || '';
        const type = href.includes('/series/') ? 'series' : 'movie';

        if (title && slug) {
          results.push({ title, slug, type, posterUrl });
        }
      });

      return results;
    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    }
  }

  async fetchDetails(slug: string, type: 'movie' | 'series') {
    try {
      const response = await fetch(`${this.baseUrl}/${type}/${slug}`);
      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('.content-title').text().trim();
      const description = $('.content-description').text().trim();
      const posterUrl = $('.content-poster img').attr('src') || '';
      
      // Mocking for now as the actual site structure might vary
      // In a real scenario, we would parse seasons and episodes here
      
      return {
        title,
        description,
        posterUrl,
        slug,
        type
      };
    } catch (error) {
      console.error(`Error fetching details for ${slug}:`, error);
      return null;
    }
  }
}

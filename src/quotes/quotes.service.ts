import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

// ✅ Use require instead of import
const https = require('https');

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  async getQuoteOfTheDay() {
    try {
      this.logger.log('🌐 Sending request to Quotable API...');

      const response = await axios.get('https://api.quotable.io/random', {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      this.logger.log(`📢 Full API Response: ${JSON.stringify(response.data)}`);

      if (!response.data || !response.data.content || !response.data.author) {
        throw new Error('Invalid API response structure');
      }

      const { content, author } = response.data;
      this.logger.log(`✅ Quote received: "${content}" - ${author}`);

      return { quote: content, author };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch quote: ${error.message}`);

      if (error.response) {
        this.logger.error(
          `🚨 API Response Error: ${JSON.stringify(error.response.data)}`,
        );
      }

      return { quote: 'No quote available', author: 'Unknown' };
    }
  }
}

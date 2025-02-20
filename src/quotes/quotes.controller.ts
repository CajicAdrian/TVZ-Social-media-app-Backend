import { Controller, Get, Logger } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @Get('qod')
  async getQuoteOfTheDay() {
    this.logger.log('📢 Fetching quote from external API...');
    const quote = await this.quotesService.getQuoteOfTheDay();
    this.logger.log(`✅ Received quote: ${JSON.stringify(quote)}`);
    return quote;
  }
}

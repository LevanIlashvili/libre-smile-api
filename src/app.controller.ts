import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TransferRequest } from './request/transfer.request';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('transfer')
  async transfer(@Body() req: TransferRequest) {
    const tx = await this.appService.transfer(req.username, 1);
    return {
      tx,
    };
  }
}

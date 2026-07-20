import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  welcome(): { message: string; version: string; timestamp: string } {
    return {
      message: '🍛 Welcome to The DABBA Company API - India\'s Smart Subscription Platform for Home-Cooked Tiffin Services',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}

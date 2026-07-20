import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/roles.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  health(): { status: string; timestamp: string } {
    return this.appService.health();
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'API welcome message' })
  welcome(): { message: string; version: string; timestamp: string } {
    return this.appService.welcome();
  }
}


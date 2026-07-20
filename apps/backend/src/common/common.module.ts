import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Common Module
 * Contains shared utilities, pipes, guards, interceptors, and configurations
 * that are used across the entire application
 */
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class CommonModule {}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateProviderStatusDto, UpdateSystemSettingDto, WaitlistConversionDto, GlobalAnalyticsResponseDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Provider, Customer, SystemSetting } from '../database/entities';

@ApiTags('Admin Controls')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // PROVIDER & CUSTOMER CONTROL
  // ==========================================

  @Patch('providers/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update provider registration audit verification status (Admins only)' })
  @ApiResponse({ status: 200, description: 'Provider verification status updated successfully' })
  async updateProviderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProviderStatusDto,
  ): Promise<Provider> {
    return this.adminService.updateProviderVerificationStatus(id, dto);
  }

  @Get('providers')
  @ApiOperation({ summary: 'List all tiffin providers (Filter by status optional)' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Providers list retrieved successfully' })
  async listProviders(@Query('status') status?: string): Promise<Provider[]> {
    return this.adminService.listProviders(status);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List all end customers registered' })
  @ApiResponse({ status: 200, description: 'Customers list retrieved successfully' })
  async listCustomers(): Promise<Customer[]> {
    return this.adminService.listCustomers();
  }

  // ==========================================
  // GLOBAL ANALYTICS
  // ==========================================

  @Get('analytics')
  @ApiOperation({ summary: 'Retrieve global summaries of orders, revenues, signups (Admins only)' })
  @ApiResponse({ status: 200, description: 'Global dashboard metrics report data', type: GlobalAnalyticsResponseDto })
  async getAnalytics(): Promise<GlobalAnalyticsResponseDto> {
    return this.adminService.getGlobalAnalytics();
  }

  // ==========================================
  // SYSTEM CONFIGURATIONS
  // ==========================================

  @Get('settings')
  @ApiOperation({ summary: 'Get list of active platform configuration settings' })
  @ApiResponse({ status: 200, description: 'Platform settings list retrieved successfully' })
  async getSettings(): Promise<SystemSetting[]> {
    return this.adminService.getSystemSettings();
  }

  @Patch('settings/:key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a platform global configuration setting parameter' })
  @ApiResponse({ status: 200, description: 'System setting updated successfully' })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSystemSettingDto,
  ): Promise<SystemSetting> {
    return this.adminService.updateSystemSetting(key, dto.value);
  }

  // ==========================================
  // WAITLIST OPERATIONS
  // ==========================================

  @Post('waitlist/convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger notifications to all waitlisted users in a pincode when provider launches' })
  @ApiResponse({ status: 200, description: 'Waitlist users notified successfully' })
  async convertWaitlist(
    @Body() dto: WaitlistConversionDto,
  ): Promise<{ notifiedCount: number }> {
    return this.adminService.convertWaitlist(dto.pincode);
  }
}

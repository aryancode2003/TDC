/**
 * Pagination DTO and utilities
 * Used for paginating list endpoints
 */

import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const pages = Math.ceil(total / limit);
  const hasNextPage = page < pages;
  const hasPreviousPage = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNextPage,
      hasPreviousPage,
    },
  };
}

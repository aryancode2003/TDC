/**
 * Custom Validation Pipe
 * Validates request payloads and returns formatted error messages
 */

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate, ValidationError as ClassValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: any) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      skipMissingProperties: false,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ClassValidationError[]): any {
    return errors.reduce(
      (acc, error) => {
        acc[error.property] = Object.values(error.constraints || {}).join(', ');
        return acc;
      },
      {} as Record<string, string>,
    );
  }
}

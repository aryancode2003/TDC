import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateWaitlistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsOptional()
  preferredMealType?: string; // 'breakfast' | 'lunch' | 'dinner' | 'all'
}

export class WaitlistResponseDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  pincode: string;
  city: string;
  state: string;
  preferredMealType: string;
  status: string;
  createdAt: Date;
}

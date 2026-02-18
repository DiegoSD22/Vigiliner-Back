import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  imei: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
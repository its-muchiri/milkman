import { IsString, IsInt, Min, Max, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsInt()
  @Min(1)
  @Max(200)
  packs: number;

  @IsOptional()
  @IsString()
  note?: string;
}

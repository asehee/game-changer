import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class FirstChargeDto {
  @ApiProperty({
    description: 'Temporary wallet address for first charge',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  @IsString()
  @IsNotEmpty()
  tempAddress: string;
}
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '지갑 주소',
    example: 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a',
  })
  walletAddress: string;
}
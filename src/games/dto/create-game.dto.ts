import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({
    description: 'Game title',
    example: 'Test Game',
  })
  title: string;

  @ApiProperty({
    description: 'Game version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Whether the game is active',
    example: true,
    default: true,
  })
  isActive?: boolean;
}
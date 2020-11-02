import { ApiProperty } from '@nestjs/swagger';

export class ConnectDto {
  @ApiProperty()
  user: string;

  @ApiProperty()
  password: string;
  
  @ApiProperty()
  server: string;

  @ApiProperty()
  database: string;

  @ApiProperty()
  startdate: string;

  @ApiProperty()
  port: number;
}
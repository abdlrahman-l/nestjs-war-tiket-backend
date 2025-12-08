import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  seatId: number;
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    // wrap the operation within transaction
    // so if there is an error, the database will be rolledback
    return this.prisma.$transaction(async (tx) => {
      const seat = await tx.seat.findUnique({
        where: {
          id: dto.seatId,
        },
      });

      if (!seat) {
        throw new NotFoundException('Seat tidak ditemukan');
      }

      if (seat.status !== 'AVAILABLE') {
        throw new BadRequestException('Seat tidak tersedia');
      }

      // using updateMany because update method only able to receive one unique where attribute (id)
      // in here, we want to filter where using version as well
      const updateResult = await tx.seat.updateMany({
        where: {
          id: dto.seatId,
          version: seat.version,
        },
        data: {
          status: 'BOOKED',
          version: {
            increment: 1, // increment the version
          },
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException(
          'Seat tidak tersedia. Seat baru saja dibook oleh orang lain',
        );
      }

      // create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          seatId: dto.seatId,
          // add 5 minutes expires
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          status: 'PENDING',
        },
      });

      return {
        bookingId: booking.id,
        seatNumber: seat.seatNumber,
        expiresAt: booking.expiresAt,
      };
    });
  }

  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const now = new Date();

    // find pending booking and expiresAt < now
    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: now, // expires time < now
        },
      },
      include: {
        seat: true, // include seat data as well
      },
    });

    console.log(
      `Found ${expiredBookings.length} expired bookings`,
      expiredBookings,
    );

    if (expiredBookings.length === 0) {
      return;
    }

    await Promise.all(
      expiredBookings.map(async (booking) => {
        return this.prisma.$transaction(async (tx) => {
          // update status booking jadi cancelled
          await tx.booking.update({
            where: {
              id: booking.id,
            },
            data: {
              status: 'CANCELLED',
            },
          });

          // balikin kursi jadi available
          await tx.seat.update({
            where: {
              id: booking.seatId,
            },
            data: {
              status: 'AVAILABLE',
              version: {
                increment: 1,
              },
            },
          });
        });
      }),
    );
  }
}

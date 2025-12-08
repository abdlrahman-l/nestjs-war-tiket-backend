import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { BookingModule } from './booking/booking.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseWrapperInterceptor } from './common/interceptors/response-wrapper.interceptors';
import { GlobalExceptionFilter } from './common/filters/http-exceptions.filter';

@Module({
  imports: [PrismaModule, AuthModule, EventModule, UserModule, BookingModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseWrapperInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}

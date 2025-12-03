/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
// 'jwt' di sini adalah nama strategi-nya. Defaultnya emang 'jwt'.
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // 1. CARA NGAMBIL TOKEN
      // "Pak Satpam, cari tokennya di Header 'Authorization', yang depannya ada tulisan 'Bearer'"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. CEK KADALUARSA
      // "Kalau tiketnya udah expired, tolak langsung! Jangan kasih masuk."
      ignoreExpiration: false,

      // 3. KUNCI RAHASIA (SIGNATURE)
      // "Cek tanda tangan di tiketnya pake stempel rahasia ini. Kalau beda dikit, berarti palsu."
      secretOrKey: process.env.JWT_SECRET || 'rahasia_negara', // Harus SAMA PERSIS sama yang di Module
    });
  }

  // 4. VALIDASI LOLOS (The Payload)
  // Function ini CUMA JALAN kalau tokennya valid (signature cocok & belum expired).
  // 'payload' itu isi data JSON yang ada di dalem token (hasil decode).
  validate(payload: any) {
    // Apapun yang lo return disini, bakal otomatis ditempel ke 'req.user'
    // Jadi di controller nanti lo bisa panggil: req.user.userId
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}

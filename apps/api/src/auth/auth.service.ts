import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { normalizeKePhone } from '@milkman/shared';
import { User } from '../database/entities/user.entity';

export interface LoginResult {
  accessToken: string;
  user: { id: string; role: string; name: string; email: string | null; phone: string | null; adminPerms: string[] };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Admins log in with email + password; riders with phone + password.
   * The identifier is matched against both columns so one endpoint serves both roles.
   */
  async login(identifier: string, password: string): Promise<LoginResult> {
    const trimmed = identifier.trim();
    // Riders may type 07xx/01xx/254…; match the stored E.164 form too.
    const phone = normalizeKePhone(trimmed);
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :id OR u.phone = :id OR (u.phone = :phone AND :phone IS NOT NULL)', {
        id: trimmed,
        phone,
      })
      .getOne();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Wrong credentials or inactive account.');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Wrong credentials or inactive account.');
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return {
      accessToken,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        adminPerms: user.adminPerms,
      },
    };
  }

  async me(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

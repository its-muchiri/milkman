import { Controller, ForbiddenException, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AuthUser, CurrentUser, Roles } from '../auth/auth.decorators';
import { UsersService } from './users.service';

/**
 * Role-based access (spec: riders see only their own data).
 * - GET /users            → admin only.
 * - GET /users/:id        → admin, or a rider fetching themselves.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles('admin')
  @Get()
  list() {
    return this.users.list();
  }

  @Roles('admin', 'rider')
  @Get(':id')
  async byId(@CurrentUser() me: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    if (me.role !== 'admin' && me.id !== id) {
      throw new ForbiddenException('Riders may only view their own record.');
    }
    return this.users.byId(id);
  }
}

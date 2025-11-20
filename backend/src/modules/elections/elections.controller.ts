import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
} from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ElectionStatus } from './entities/election.entity';
import { Throttle } from '@nestjs/throttler';

@Controller('elections')
@UseGuards(JwtAuthGuard)
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  /**
   * Crear nueva elección (Solo ADMIN)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(@Body() createElectionDto: CreateElectionDto) {
    console.log('[ElectionsController] Create election called');
    console.log('[ElectionsController] DTO received:', createElectionDto);
    const result = await this.electionsService.create(createElectionDto);
    console.log('[ElectionsController] Election created:', result.id);
    return result;
  }

  /**
   * Obtener todas las elecciones
   */
  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async findAll(@Req() req: any) {
    return await this.electionsService.findAll(req.user.role);
  }

  /**
   * Obtener elecciones activas para votar
   */
  @Get('active')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async findActive() {
    return await this.electionsService.findActive();
  }

  /**
   * Obtener una elección por ID
   */
  @Get(':id')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.electionsService.findOne(id, req.user.role);
  }

  /**
   * Actualizar elección (Solo ADMIN)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async update(
    @Param('id') id: string,
    @Body() updateElectionDto: UpdateElectionDto,
  ) {
    return await this.electionsService.update(id, updateElectionDto);
  }

  /**
   * Actualizar estado de elección (Solo ADMIN)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ElectionStatus,
  ) {
    return await this.electionsService.updateStatus(id, status);
  }

  /**
   * Eliminar elección (soft delete) (Solo ADMIN)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async delete(@Param('id') id: string) {
    return await this.electionsService.delete(id);
  }
}


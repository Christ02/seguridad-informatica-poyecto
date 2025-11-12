import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CandidatesService, CreateCandidateDto, UpdateCandidateDto } from './candidates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Throttle } from '@nestjs/throttler';

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  /**
   * Crear candidato (Solo ADMIN)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async create(@Body() createCandidateDto: CreateCandidateDto) {
    return await this.candidatesService.create(createCandidateDto);
  }

  /**
   * Obtener candidatos de una elección
   */
  @Get('election/:electionId')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async findByElection(@Param('electionId') electionId: string) {
    return await this.candidatesService.findByElection(electionId);
  }

  /**
   * Obtener candidato por ID
   */
  @Get(':id')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async findOne(@Param('id') id: string) {
    return await this.candidatesService.findOne(id);
  }

  /**
   * Actualizar candidato (Solo ADMIN)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return await this.candidatesService.update(id, updateCandidateDto);
  }

  /**
   * Eliminar candidato (Solo ADMIN)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async delete(@Param('id') id: string) {
    return await this.candidatesService.delete(id);
  }

  /**
   * Obtener resultados de una elección
   */
  @Get('election/:electionId/results')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getResults(@Param('electionId') electionId: string) {
    return await this.candidatesService.getResults(electionId);
  }
}


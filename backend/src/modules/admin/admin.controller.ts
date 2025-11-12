import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Throttle } from '@nestjs/throttler';
import { AuditService } from '../audit/audit.service';
import { 
  UpdateUserRoleDto, 
  UpdateUserStatusDto,
  UpdateCandidateDto,
  UpdateElectionStatusDto 
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Obtener estadísticas generales del dashboard
   */
  @Get('dashboard/stats')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getDashboardStats() {
    return await this.adminService.getDashboardStats();
  }

  /**
   * Obtener actividad reciente del sistema
   */
  @Get('dashboard/activity')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getRecentActivity(@Query('limit') limit?: number) {
    return await this.adminService.getRecentActivity(limit || 10);
  }

  /**
   * Obtener tendencias de votación
   */
  @Get('dashboard/trends')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getVotingTrends(@Query('days') days?: number) {
    return await this.adminService.getVotingTrends(days || 7);
  }

  /**
   * Obtener historial completo de votaciones con filtros
   */
  @Get('votes/history')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getVotesHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('electionId') electionId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.adminService.getVotesHistory({
      page: page || 1,
      limit: limit || 20,
      status,
      electionId,
      startDate,
      endDate,
    });
  }

  /**
   * Obtener resultados detallados de una elección
   */
  @Get('elections/:id/results')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async getDetailedResults(@Param('id') electionId: string) {
    return await this.adminService.getDetailedResults(electionId);
  }

  /**
   * Obtener análisis demográfico de votos
   */
  @Get('elections/:id/demographics')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getDemographics(@Param('id') electionId: string) {
    return await this.adminService.getDemographics(electionId);
  }

  /**
   * Obtener todos los usuarios (con paginación)
   */
  @Get('users')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('verified') verified?: string,
  ) {
    return await this.adminService.getUsers({
      page: page || 1,
      limit: limit || 20,
      role,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    });
  }

  /**
   * Obtener estadísticas de usuarios
   */
  @Get('users/stats')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getUserStats() {
    return await this.adminService.getUserStats();
  }

  /**
   * Obtener detalles de un usuario específico (Solo ADMIN/SUPER_ADMIN)
   */
  @Get('users/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async getUserDetails(@Param('id') userId: string, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    await this.auditService.logEvent(
      'ADMIN_USER_VIEW',
      adminId,
      ip,
      `Admin visualizó detalles de usuario ${userId}`,
      { targetUserId: userId },
    );

    return await this.adminService.getUserDetails(userId);
  }

  /**
   * Actualizar rol de usuario (Solo SUPER_ADMIN)
   */
  @Patch('users/:id/role')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    // No permitir cambiar el rol de sí mismo
    if (adminId === userId) {
      throw new BadRequestException('No puedes cambiar tu propio rol');
    }

    const result = await this.adminService.updateUserRole(userId, updateRoleDto.role);

    await this.auditService.logEvent(
      'ADMIN_ROLE_CHANGE',
      adminId,
      ip,
      `Admin cambió rol de usuario ${userId} a ${updateRoleDto.role}`,
      { targetUserId: userId, newRole: updateRoleDto.role },
    );

    return result;
  }

  /**
   * Activar/Desactivar usuario (Solo ADMIN/SUPER_ADMIN)
   */
  @Patch('users/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    // No permitir desactivar la propia cuenta
    if (adminId === userId) {
      throw new BadRequestException('No puedes cambiar el estado de tu propia cuenta');
    }

    const result = await this.adminService.updateUserStatus(
      userId,
      updateStatusDto.isActive,
    );

    await this.auditService.logEvent(
      'ADMIN_USER_STATUS_CHANGE',
      adminId,
      ip,
      `Admin ${updateStatusDto.isActive ? 'activó' : 'desactivó'} usuario ${userId}`,
      { targetUserId: userId, newStatus: updateStatusDto.isActive },
    );

    return result;
  }

  /**
   * Eliminar usuario (soft delete) (Solo SUPER_ADMIN)
   */
  @Delete('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async deleteUser(@Param('id') userId: string, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    // No permitir eliminar la propia cuenta
    if (adminId === userId) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    }

    const result = await this.adminService.deleteUser(userId);

    await this.auditService.logEvent(
      'ADMIN_USER_DELETE',
      adminId,
      ip,
      `Admin eliminó usuario ${userId}`,
      { targetUserId: userId },
    );

    return result;
  }

  /**
   * Actualizar candidato (Solo ADMIN/SUPER_ADMIN)
   */
  @Patch('candidates/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async updateCandidate(
    @Param('id') candidateId: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    const result = await this.adminService.updateCandidate(candidateId, updateCandidateDto);

    await this.auditService.logEvent(
      'ADMIN_CANDIDATE_UPDATE',
      adminId,
      ip,
      `Admin actualizó candidato ${candidateId}`,
      { candidateId, updates: Object.keys(updateCandidateDto) },
    );

    return result;
  }

  /**
   * Eliminar candidato (Solo ADMIN/SUPER_ADMIN)
   */
  @Delete('candidates/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deleteCandidate(@Param('id') candidateId: string, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    const result = await this.adminService.deleteCandidate(candidateId);

    await this.auditService.logEvent(
      'ADMIN_CANDIDATE_DELETE',
      adminId,
      ip,
      `Admin eliminó candidato ${candidateId}`,
      { candidateId },
    );

    return result;
  }

  /**
   * Activar/Desactivar candidato (Solo ADMIN/SUPER_ADMIN)
   */
  @Patch('candidates/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async toggleCandidateStatus(
    @Param('id') candidateId: string,
    @Body('isActive') isActive: boolean,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    const result = await this.adminService.toggleCandidateStatus(candidateId, isActive);

    await this.auditService.logEvent(
      'ADMIN_CANDIDATE_STATUS_CHANGE',
      adminId,
      ip,
      `Admin ${isActive ? 'activó' : 'desactivó'} candidato ${candidateId}`,
      { candidateId, newStatus: isActive },
    );

    return result;
  }

  /**
   * Actualizar estado de elección (Solo ADMIN/SUPER_ADMIN)
   */
  @Patch('elections/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateElectionStatus(
    @Param('id') electionId: string,
    @Body() updateStatusDto: UpdateElectionStatusDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    const result = await this.adminService.updateElectionStatus(
      electionId,
      updateStatusDto.status,
    );

    await this.auditService.logEvent(
      'ADMIN_ELECTION_STATUS_CHANGE',
      adminId,
      ip,
      `Admin cambió estado de elección ${electionId} a ${updateStatusDto.status}`,
      { electionId, newStatus: updateStatusDto.status },
    );

    return result;
  }

  /**
   * Actualizar elección (Solo ADMIN/SUPER_ADMIN)
   */
  @Patch('elections/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async updateElection(
    @Param('id') electionId: string,
    @Body() updateElectionDto: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    const result = await this.adminService.updateElection(electionId, updateElectionDto);

    await this.auditService.logEvent(
      'ADMIN_ELECTION_UPDATE',
      adminId,
      ip,
      `Admin actualizó elección ${electionId}`,
      { electionId, updates: Object.keys(updateElectionDto) },
    );

    return result;
  }

  /**
   * Eliminar elección (soft delete) (Solo SUPER_ADMIN)
   */
  @Delete('elections/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async deleteElection(@Param('id') electionId: string, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    const result = await this.adminService.deleteElection(electionId);

    await this.auditService.logEvent(
      'ADMIN_ELECTION_DELETE',
      adminId,
      ip,
      `Admin eliminó elección ${electionId}`,
      { electionId },
    );

    return result;
  }

  /**
   * Exportar resultados de elección en formato CSV
   */
  @Get('elections/:id/export/csv')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async exportElectionCSV(@Param('id') electionId: string, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    await this.auditService.logEvent(
      'ADMIN_EXPORT_CSV',
      adminId,
      ip,
      `Admin exportó resultados CSV de elección ${electionId}`,
      { electionId, format: 'CSV' },
    );

    return await this.adminService.exportElectionCSV(electionId);
  }

  /**
   * Exportar resultados de elección en formato PDF
   */
  @Get('elections/:id/export/pdf')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async exportElectionPDF(@Param('id') electionId: string, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    await this.auditService.logEvent(
      'ADMIN_EXPORT_PDF',
      adminId,
      ip,
      `Admin exportó resultados PDF de elección ${electionId}`,
      { electionId, format: 'PDF' },
    );

    return await this.adminService.exportElectionPDF(electionId);
  }

  /**
   * Obtener logs de auditoría filtrados
   */
  @Get('audit-logs')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('eventType') eventType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    await this.auditService.logEvent(
      'ADMIN_AUDIT_LOG_VIEW',
      adminId,
      ip,
      'Admin consultó logs de auditoría',
      { filters: { page, limit, eventType, userId, startDate, endDate } },
    );

    return await this.adminService.getAuditLogs({
      page: page || 1,
      limit: limit || 50,
      eventType,
      userId,
      startDate,
      endDate,
    });
  }

  /**
   * Obtener estadísticas de seguridad
   */
  @Get('security/stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getSecurityStats(@Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress;
    const adminId = req.user.sub;

    await this.auditService.logEvent(
      'ADMIN_SECURITY_STATS_VIEW',
      adminId,
      ip,
      'Admin consultó estadísticas de seguridad',
    );

    return await this.adminService.getSecurityStats();
  }
}


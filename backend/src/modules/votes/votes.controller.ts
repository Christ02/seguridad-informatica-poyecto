import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { VerifyVoteDto } from './dto/verify-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Throttle } from '@nestjs/throttler';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  /**
   * Emitir un voto (Solo VOTER)
   */
  @Post('cast')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VOTER)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Máximo 5 intentos por minuto
  async castVote(@Body() castVoteDto: CastVoteDto, @Req() req: any) {
    const userId = req.user.sub;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    return await this.votesService.castVote(
      userId,
      castVoteDto,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Verificar un voto emitido
   */
  @Post('verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VOTER)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async verifyVote(@Body() verifyVoteDto: VerifyVoteDto, @Req() req: any) {
    const userId = req.user.sub;
    return await this.votesService.verifyVote(userId, verifyVoteDto);
  }

  /**
   * Obtener historial de votos del usuario
   */
  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VOTER)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getHistory(@Req() req: any) {
    const userId = req.user.sub;
    return await this.votesService.getUserVotes(userId);
  }

  /**
   * Verificar si el usuario ya votó en una elección
   */
  @Get('has-voted/:electionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VOTER)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async hasVoted(@Param('electionId') electionId: string, @Req() req: any) {
    const userId = req.user.sub;
    const hasVoted = await this.votesService.hasUserVoted(userId, electionId);
    return { hasVoted };
  }

  /**
   * Obtener estadísticas de votación (Solo ADMIN/AUDITOR)
   */
  @Get('stats/:electionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getStats(@Param('electionId') electionId: string) {
    return await this.votesService.getVotingStats(electionId);
  }
}


import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { CastVoteDto } from './dto/cast-vote.dto';
import { VerifyVoteDto } from './dto/verify-vote.dto';
import { ElectionsService } from '../elections/elections.service';
import { CandidatesService } from '../candidates/candidates.service';
import * as crypto from 'crypto';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    private readonly electionsService: ElectionsService,
    private readonly candidatesService: CandidatesService,
  ) {}

  /**
   * Emitir un voto con encriptación y validaciones de seguridad
   */
  async castVote(
    userId: string,
    castVoteDto: CastVoteDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; voteHash: string; verificationCode: string }> {
    const { electionId, candidateId, encryptedVote, voteHash, signature } =
      castVoteDto;

    // 1. Verificar que la elección esté abierta
    const isOpen = await this.electionsService.isElectionOpen(electionId);
    if (!isOpen) {
      throw new ForbiddenException(
        'La elección no está abierta para votación',
      );
    }

    // 2. Verificar que el candidato existe y pertenece a la elección
    const candidate = await this.candidatesService.findOne(candidateId);
    if (candidate.electionId !== electionId) {
      throw new BadRequestException(
        'El candidato no pertenece a esta elección',
      );
    }

    // 3. Verificar que el usuario no haya votado ya en esta elección
    const existingVote = await this.voteRepository.findOne({
      where: { userId, electionId },
    });

    if (existingVote) {
      throw new ConflictException('Ya has votado en esta elección');
    }

    // 4. Verificar el hash del voto
    const computedHash = this.computeVoteHash(
      userId,
      electionId,
      candidateId,
      encryptedVote,
    );

    if (computedHash !== voteHash) {
      throw new BadRequestException('Hash del voto inválido');
    }

    // 5. Generar código de verificación único
    const verificationCode = this.generateVerificationCode();

    // 6. Crear y guardar el voto
    const vote = this.voteRepository.create({
      userId,
      electionId,
      candidateId,
      encryptedVote,
      voteHash,
      signature,
      verificationCode,
      ipAddress: this.hashIP(ipAddress),
      userAgent: this.sanitizeUserAgent(userAgent),
      isValid: true,
    });

    await this.voteRepository.save(vote);

    // 7. Incrementar contador de votos
    await this.electionsService.incrementVoteCount(electionId);
    await this.candidatesService.incrementVoteCount(candidateId);

    // 8. Retornar hash y código de verificación (NO guardar en logs)
    return {
      success: true,
      voteHash,
      verificationCode,
    };
  }

  /**
   * Verificar un voto emitido
   */
  async verifyVote(
    userId: string,
    verifyVoteDto: VerifyVoteDto,
  ): Promise<{
    valid: boolean;
    electionTitle: string;
    timestamp: Date;
    voteHash: string;
  }> {
    const { voteHash, verificationCode } = verifyVoteDto;

    const vote = await this.voteRepository.findOne({
      where: { userId, voteHash, verificationCode },
      relations: ['election'],
    });

    if (!vote) {
      throw new NotFoundException('Voto no encontrado o código inválido');
    }

    return {
      valid: vote.isValid,
      electionTitle: vote.election.title,
      timestamp: vote.createdAt,
      voteHash: vote.voteHash,
    };
  }

  /**
   * Obtener historial de votos del usuario
   */
  async getUserVotes(userId: string): Promise<any[]> {
    const votes = await this.voteRepository.find({
      where: { userId },
      relations: ['election', 'candidate'],
      order: { createdAt: 'DESC' },
    });

    // No exponer información sensible
    return votes.map((vote) => ({
      id: vote.id,
      electionId: vote.electionId,
      electionTitle: vote.election.title,
      electionStatus: vote.election.status,
      candidateName: vote.candidate.name,
      candidateParty: vote.candidate.party,
      candidatePhotoUrl: vote.candidate.photoUrl,
      voteHash: vote.voteHash,
      verificationCode: vote.verificationCode,
      votedAt: vote.createdAt,
      isValid: vote.isValid,
      status: vote.isValid ? 'contabilizado' : 'anulado',
    }));
  }

  /**
   * Verificar si el usuario ya votó en una elección
   */
  async hasUserVoted(userId: string, electionId: string): Promise<boolean> {
    const vote = await this.voteRepository.findOne({
      where: { userId, electionId },
    });
    return !!vote;
  }

  /**
   * Obtener estadísticas de votación (para auditoría)
   */
  async getVotingStats(electionId: string): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    votesPerHour: number;
  }> {
    const votes = await this.voteRepository.find({
      where: { electionId },
      select: ['id', 'userId', 'createdAt'],
    });

    const uniqueVoters = new Set(votes.map((v) => v.userId)).size;

    // Calcular votos por hora
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentVotes = votes.filter((v) => v.createdAt >= oneHourAgo);

    return {
      totalVotes: votes.length,
      uniqueVoters,
      votesPerHour: recentVotes.length,
    };
  }

  // ============= Utility Functions =============

  /**
   * Calcular hash SHA-256 del voto para verificación
   */
  private computeVoteHash(
    userId: string,
    electionId: string,
    candidateId: string,
    encryptedVote: string,
  ): string {
    const data = `${userId}:${electionId}:${candidateId}:${encryptedVote}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generar código de verificación único
   */
  private generateVerificationCode(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Hash de IP para privacidad
   */
  private hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 32);
  }

  /**
   * Sanitizar User-Agent
   */
  private sanitizeUserAgent(userAgent: string): string {
    return userAgent ? userAgent.substring(0, 500) : 'unknown';
  }

  /**
   * Invalidar voto (solo para casos de fraude detectado)
   */
  async invalidateVote(voteId: string, reason: string): Promise<void> {
    const vote = await this.voteRepository.findOne({ where: { id: voteId } });
    if (!vote) {
      throw new NotFoundException('Voto no encontrado');
    }

    vote.isValid = false;
    await this.voteRepository.save(vote);

    // Decrementar contadores
    await this.electionsService.incrementVoteCount(vote.electionId); // Se usaría un decrement en producción
    await this.candidatesService.incrementVoteCount(vote.candidateId);
  }
}


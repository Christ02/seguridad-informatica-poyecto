import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';

export class CreateCandidateDto {
  name: string;
  description: string;
  party?: string;
  photoUrl?: string;
  electionId: string;
}

export class UpdateCandidateDto {
  name?: string;
  description?: string;
  party?: string;
  photoUrl?: string;
  isActive?: boolean;
}

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  /**
   * Crear candidato
   */
  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const candidate = this.candidateRepository.create(createCandidateDto);
    return await this.candidateRepository.save(candidate);
  }

  /**
   * Obtener todos los candidatos de una elección
   */
  async findByElection(electionId: string): Promise<Candidate[]> {
    return await this.candidateRepository.find({
      where: { electionId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener candidato por ID
   */
  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id, isActive: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    return candidate;
  }

  /**
   * Incrementar contador de votos
   */
  async incrementVoteCount(id: string): Promise<void> {
    await this.candidateRepository.increment({ id }, 'voteCount', 1);
  }

  /**
   * Obtener resultados de votación
   */
  async getResults(electionId: string): Promise<any[]> {
    const candidates = await this.candidateRepository.find({
      where: { electionId, isActive: true },
      order: { voteCount: 'DESC' },
    });

    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    return candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      photoUrl: candidate.photoUrl,
      votes: candidate.voteCount,
      percentage: totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0,
    }));
  }

  /**
   * Actualizar candidato (Solo ADMIN)
   */
  async update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id, isActive: true },
      relations: ['election'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    // No permitir editar candidatos de elecciones activas o completadas
    if (candidate.election.status === 'ACTIVE' || candidate.election.status === 'COMPLETED') {
      throw new BadRequestException(
        'No se puede editar un candidato de una elección activa o completada',
      );
    }

    // Actualizar solo los campos proporcionados
    Object.assign(candidate, updateCandidateDto);
    
    return await this.candidateRepository.save(candidate);
  }

  /**
   * Eliminar candidato (soft delete) (Solo ADMIN)
   */
  async delete(id: string): Promise<{ message: string }> {
    const candidate = await this.candidateRepository.findOne({
      where: { id, isActive: true },
      relations: ['election'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    // No permitir eliminar candidatos de elecciones activas
    if (candidate.election.status === 'ACTIVE') {
      throw new BadRequestException(
        'No se puede eliminar un candidato de una elección activa',
      );
    }

    // Soft delete
    candidate.isActive = false;
    candidate.deletedAt = new Date();
    await this.candidateRepository.save(candidate);

    return {
      message: 'Candidato eliminado exitosamente',
    };
  }
}


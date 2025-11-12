import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ElectionStatus } from '../../elections/entities/election.entity';

/**
 * DTO para actualizar el rol de un usuario
 */
export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'El rol debe ser válido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  role: UserRole;
}

/**
 * DTO para actualizar el estado de un usuario
 */
export class UpdateUserStatusDto {
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  isActive: boolean;
}

/**
 * DTO para actualizar un candidato
 */
export class UpdateCandidateDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'El partido debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El partido no puede exceder 100 caracteres' })
  party?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto debe ser válida' })
  @MaxLength(500, { message: 'La URL no puede exceder 500 caracteres' })
  photoUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;
}

/**
 * DTO para actualizar el estado de una elección
 */
export class UpdateElectionStatusDto {
  @IsEnum(ElectionStatus, { message: 'El estado debe ser válido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: ElectionStatus;
}

/**
 * DTO para actualizar una elección
 */
export class UpdateElectionDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'La fecha de inicio debe ser una cadena de texto' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'La fecha de fin debe ser una cadena de texto' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'allowMultipleVotes debe ser un valor booleano' })
  allowMultipleVotes?: boolean;
}


import { 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsDateString,
  IsBoolean 
} from 'class-validator';

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
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'allowMultipleVotes debe ser un valor booleano' })
  allowMultipleVotes?: boolean;
}


import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'El DPI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El DPI es requerido' })
  @Matches(/^[0-9]{13}$/, {
    message: 'El DPI debe tener exactamente 13 dígitos numéricos',
  })
  dpi: string;

  @IsString({ message: 'Los nombres son requeridos' })
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los nombres no pueden exceder 100 caracteres' })
  firstName: string;

  @IsString({ message: 'Los apellidos son requeridos' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los apellidos no pueden exceder 100 caracteres' })
  lastName: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  dateOfBirth: string;

  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de teléfono es requerido' })
  @Matches(/^[0-9]{8}$/, {
    message: 'El número de teléfono debe tener exactamente 8 dígitos',
  })
  phoneNumber: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
  password: string;

  @IsOptional()
  @IsString()
  department?: string; // Departamento de Guatemala (opcional)

  @IsOptional()
  @IsString()
  municipality?: string; // Municipio (opcional)

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address?: string; // Dirección completa (opcional)
}

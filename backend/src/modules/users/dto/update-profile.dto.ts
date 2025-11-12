import {
  IsOptional,
  IsString,
  MaxLength,
  IsEmail,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{8}$/, {
    message: 'El número de teléfono debe tener exactamente 8 dígitos',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
  newPassword: string;
}


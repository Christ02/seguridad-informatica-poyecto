import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 13, unique: true, comment: 'DPI de Guatemala (13 dígitos)' })
  @Index()
  dpi: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'date', comment: 'Fecha de nacimiento' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 8, comment: 'Número de teléfono de Guatemala (8 dígitos)' })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Departamento de Guatemala' })
  department: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Municipio de Guatemala' })
  municipality: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'Dirección completa' })
  address: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VOTER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  mfaSecret: string | null;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', nullable: true })
  lastLoginIp: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  // Relación con códigos 2FA
  @OneToMany('TwoFactorCode', 'user')
  twoFactorCodes: any[];

  // Método helper para obtener el nombre completo
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Método helper para obtener la edad
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Método helper para formatear el teléfono
  get formattedPhone(): string {
    return `+502 ${this.phoneNumber.substring(0, 4)}-${this.phoneNumber.substring(4)}`;
  }
}

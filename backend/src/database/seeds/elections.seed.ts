import { DataSource } from 'typeorm';
import { Election, ElectionStatus } from '../../modules/elections/entities/election.entity';
import { Candidate } from '../../modules/candidates/entities/candidate.entity';
import * as crypto from 'crypto';

export async function seedElections(dataSource: DataSource): Promise<void> {
  const electionRepository = dataSource.getRepository(Election);
  const candidateRepository = dataSource.getRepository(Candidate);

  // Verificar si ya existen elecciones
  const existingElections = await electionRepository.count();
  if (existingElections > 0) {
    console.log('✅ Elections already seeded');
    return;
  }

  console.log('🌱 Seeding elections and candidates...');

  // Elección 1: Presidencial 2025 (ACTIVE)
  const election1 = electionRepository.create({
    title: 'Elecciones Presidenciales 2025',
    description:
      'Elección presidencial para el período 2025-2029. Los ciudadanos elegirán al próximo presidente de la nación.',
    startDate: new Date('2025-11-01T00:00:00Z'),
    endDate: new Date('2025-12-31T23:59:59Z'),
    status: ElectionStatus.ACTIVE,
    totalVotes: 0,
    isActive: true,
    allowMultipleVotes: false,
    encryptionKey: crypto.randomBytes(32).toString('hex'),
  });
  await electionRepository.save(election1);

  // Candidatos para Elección 1
  const candidates1 = [
    {
      name: 'María González',
      description:
        'Economista con 20 años de experiencia en política pública. Propone modernizar la economía nacional.',
      party: 'Partido Progresista',
      photoUrl: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=2563eb&color=fff&size=200',
      electionId: election1.id,
    },
    {
      name: 'Carlos Rodríguez',
      description:
        'Ex alcalde y empresario. Enfocado en crear empleos y mejorar la infraestructura nacional.',
      party: 'Alianza Nacional',
      photoUrl: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=059669&color=fff&size=200',
      electionId: election1.id,
    },
    {
      name: 'Ana Martínez',
      description:
        'Senadora con enfoque en educación y tecnología. Propone educación gratuita y universal.',
      party: 'Movimiento Ciudadano',
      photoUrl: 'https://ui-avatars.com/api/?name=Ana+Martinez&background=dc2626&color=fff&size=200',
      electionId: election1.id,
    },
    {
      name: 'Roberto Silva',
      description:
        'Abogado y defensor de derechos humanos. Prioriza justicia social y transparencia.',
      party: 'Frente Democrático',
      photoUrl: 'https://ui-avatars.com/api/?name=Roberto+Silva&background=7c3aed&color=fff&size=200',
      electionId: election1.id,
    },
  ];

  for (const candidateData of candidates1) {
    const candidate = candidateRepository.create(candidateData);
    await candidateRepository.save(candidate);
  }

  // Elección 2: Consejo Estudiantil (UPCOMING)
  const election2 = electionRepository.create({
    title: 'Consejo Estudiantil Universitario 2025',
    description:
      'Elección para representantes estudiantiles. Los estudiantes elegirán a sus delegados ante el consejo universitario.',
    startDate: new Date('2025-12-01T00:00:00Z'),
    endDate: new Date('2025-12-15T23:59:59Z'),
    status: ElectionStatus.DRAFT,
    totalVotes: 0,
    isActive: true,
    allowMultipleVotes: false,
    encryptionKey: crypto.randomBytes(32).toString('hex'),
  });
  await electionRepository.save(election2);

  // Candidatos para Elección 2
  const candidates2 = [
    {
      name: 'Laura Pérez',
      description: 'Estudiante de Ingeniería. Propone mejorar instalaciones deportivas.',
      party: 'Lista Azul',
      photoUrl: 'https://ui-avatars.com/api/?name=Laura+Perez&background=0ea5e9&color=fff&size=200',
      electionId: election2.id,
    },
    {
      name: 'Diego Fernández',
      description: 'Estudiante de Derecho. Enfoque en becas y ayuda estudiantil.',
      party: 'Lista Verde',
      photoUrl: 'https://ui-avatars.com/api/?name=Diego+Fernandez&background=16a34a&color=fff&size=200',
      electionId: election2.id,
    },
    {
      name: 'Sofía Torres',
      description: 'Estudiante de Medicina. Prioriza salud mental estudiantil.',
      party: 'Lista Naranja',
      photoUrl: 'https://ui-avatars.com/api/?name=Sofia+Torres&background=ea580c&color=fff&size=200',
      electionId: election2.id,
    },
  ];

  for (const candidateData of candidates2) {
    const candidate = candidateRepository.create(candidateData);
    await candidateRepository.save(candidate);
  }

  // Elección 3: Reforma Estatutaria (COMPLETED)
  const election3 = electionRepository.create({
    title: 'Reforma Estatutaria Nacional',
    description:
      'Referéndum sobre modificaciones constitucionales. Los ciudadanos decidirán sobre cambios clave en la constitución.',
    startDate: new Date('2025-10-01T00:00:00Z'),
    endDate: new Date('2025-10-15T23:59:59Z'),
    status: ElectionStatus.COMPLETED,
    totalVotes: 2856,
    isActive: true,
    allowMultipleVotes: false,
    encryptionKey: crypto.randomBytes(32).toString('hex'),
  });
  await electionRepository.save(election3);

  // Candidatos para Elección 3 (Opciones SÍ/NO)
  const candidates3 = [
    {
      name: 'A Favor de la Reforma',
      description: 'Voto a favor de implementar las modificaciones constitucionales propuestas.',
      party: 'Opción Sí',
      photoUrl: 'https://ui-avatars.com/api/?name=Si&background=22c55e&color=fff&size=200',
      voteCount: 1654,
      electionId: election3.id,
    },
    {
      name: 'En Contra de la Reforma',
      description: 'Voto en contra de las modificaciones constitucionales propuestas.',
      party: 'Opción No',
      photoUrl: 'https://ui-avatars.com/api/?name=No&background=ef4444&color=fff&size=200',
      voteCount: 1202,
      electionId: election3.id,
    },
  ];

  for (const candidateData of candidates3) {
    const candidate = candidateRepository.create(candidateData);
    await candidateRepository.save(candidate);
  }

  console.log('✅ Elections and candidates seeded successfully!');
  console.log(`   - 3 elections created`);
  console.log(`   - ${candidates1.length + candidates2.length + candidates3.length} candidates created`);
}


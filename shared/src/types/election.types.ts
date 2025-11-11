export enum ElectionStatus {
  DRAFT = 'DRAFT',
  PENDING_KEY_CEREMONY = 'PENDING_KEY_CEREMONY',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  COUNTING = 'COUNTING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ElectionType {
  PRESIDENTIAL = 'PRESIDENTIAL',
  CONGRESSIONAL = 'CONGRESSIONAL',
  REFERENDUM = 'REFERENDUM',
  LOCAL = 'LOCAL',
  INTERNAL = 'INTERNAL',
}

export interface Election {
  id: string;
  title: string;
  description: string;
  type: ElectionType;
  status: ElectionStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  publicKey: string;
  thresholdParams: {
    totalShares: number;
    threshold: number;
    custodianIds: number[];
  };
  keyCeremonyCompletedAt?: Date;
  closedAt?: Date;
  resultsPublishedAt?: Date;
  totalEligibleVoters: number;
  totalVotesCast: number;
  allowedVoterRoles?: string[];
  requiresIdentityVerification: boolean;
  isAnonymous: boolean;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  party?: string;
  description?: string;
  photoUrl?: string;
  order: number;
  createdAt: Date;
}

export interface VoteOption {
  id: string;
  electionId: string;
  optionText: string;
  order: number;
  createdAt: Date;
}

export interface ElectionResults {
  electionId: string;
  totalVotes: number;
  results: CandidateResult[] | VoteOptionResult[];
  merkleRoot: string;
  verificationHash: string;
  publishedAt: Date;
  publishedBy: string;
  decryptionCustodians: string[];
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  voteCount: number;
  percentage: number;
}

export interface VoteOptionResult {
  optionId: string;
  optionText: string;
  voteCount: number;
  percentage: number;
}

export interface KeyCeremony {
  id: string;
  electionId: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  publicKey: string;
  keyShares: KeyShareInfo[];
  initiatedAt: Date;
  initiatedBy: string;
  completedAt?: Date;
  participants: string[];
  requiredSignatures: number;
  receivedSignatures: number;
}

export interface KeyShareInfo {
  custodianId: number;
  custodianEmail: string;
  shareIndex: number;
  sharePublicCommitment: string;
  distributed: boolean;
  distributedAt?: Date;
}


import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CastVoteDto {
  @IsUUID()
  @IsNotEmpty()
  electionId: string;

  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @IsString()
  @IsNotEmpty()
  encryptedVote: string;

  @IsString()
  @IsNotEmpty()
  voteHash: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsOptional()
  deviceFingerprint?: string;
}


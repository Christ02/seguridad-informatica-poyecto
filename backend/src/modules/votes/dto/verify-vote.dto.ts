import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyVoteDto {
  @IsString()
  @IsNotEmpty()
  voteHash: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}


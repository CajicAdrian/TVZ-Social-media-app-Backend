import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetPostsFilterDto {
  @IsOptional()
  @IsNotEmpty()
  search: string;
}

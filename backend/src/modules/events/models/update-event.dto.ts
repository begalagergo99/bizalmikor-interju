import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsArray()
  @IsEmail(
    {},
    { each: true, message: 'Each participant must be a valid email address' },
  )
  @ArrayUnique((email: string) => email.toLowerCase(), {
    message: 'Duplicate participant emails are not allowed',
  })
  participants?: string[];
}

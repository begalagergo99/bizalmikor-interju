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
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStartsBeforeEnds', async: false })
class IsStartsBeforeEndsConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const { startsAt, endsAt } = args.object as CreateEventDto;
    if (!startsAt || !endsAt) return true;
    return new Date(startsAt) <= new Date(endsAt);
  }

  defaultMessage(): string {
    return 'startsAt must be before or equal to endsAt';
  }
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  @Validate(IsStartsBeforeEndsConstraint)
  endsAt: string;

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

import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidScale(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidScale',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            return true;
          }
          if (Array.isArray(value)) {
            return (
              value.length >= 2 &&
              value.every(
                (item) =>
                  item &&
                  typeof item.name === 'string' &&
                  typeof item.color === 'string' &&
                  typeof item.rank === 'number',
              )
            );
          }
          return false;
        },
        defaultMessage() {
          return `The property must be either a string or an array with at least two valid ScaleDto objects.`;
        },
      },
    });
  };
}
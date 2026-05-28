import { ValueObject } from '../base-classes/value-object';

export interface NameProps {
  firstName: string;
  lastName: string;
}

export class Name extends ValueObject<NameProps> {
  private constructor(props: NameProps) {
    super(props);
  }

  public static create(firstName: string, lastName: string): Name {
    if (!firstName || firstName.trim().length < 2) {
      throw new Error('First name must have at least 2 characters');
    }
    if (!lastName || lastName.trim().length < 2) {
      throw new Error('Last name must have at least 2 characters');
    }
    return new Name({ firstName, lastName });
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public getValue(): T {
    return this.props;
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === undefined || vo === null) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

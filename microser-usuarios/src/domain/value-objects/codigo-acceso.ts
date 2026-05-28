import { ValueObject } from '../base-classes/value-object';
import { Usuario, UsuarioRol } from '../entities/usuario';

const MIN_REGISTRATION_YEAR = 1900;

export interface CodigoAccesoProps {
  codigo: string;
  anioRegistro: number;
  rol: UsuarioRol;
}

export class CodigoAcceso extends ValueObject<CodigoAccesoProps> {
  private constructor(props: CodigoAccesoProps) {
    super(props);
  }

  public static create(codigo: string, anioRegistro: number): CodigoAcceso {
    const normalizedCode = String(codigo ?? '').trim();
    const normalizedYear = Number(anioRegistro);
    const currentYear = new Date().getFullYear();

    if (!/^\d+$/.test(normalizedCode)) {
      throw new Error('Invalid user code');
    }

    if (!Number.isInteger(normalizedYear)) {
      throw new Error('Invalid registration year');
    }

    if (
      normalizedYear < MIN_REGISTRATION_YEAR ||
      normalizedYear > currentYear
    ) {
      throw new Error('Invalid registration year');
    }

    return new CodigoAcceso({
      codigo: normalizedCode,
      anioRegistro: normalizedYear,
      rol: Usuario.resolveRol(normalizedCode),
    });
  }

  get codigo(): string {
    return this.props.codigo;
  }

  get anioRegistro(): number {
    return this.props.anioRegistro;
  }

  get rol(): UsuarioRol {
    return this.props.rol;
  }

}

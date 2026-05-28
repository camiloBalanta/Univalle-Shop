import { randomUUID } from 'crypto';
import { Entity } from './entity';

interface UsuarioProps {
  id: string;
  codigo: string;
  anioRegistro: number;
  rol: UsuarioRol;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UsuarioRol = 'administrativo' | 'docente' | 'estudiante';

export class Usuario extends Entity<UsuarioProps> {
  private props: UsuarioProps;

  private constructor(props: UsuarioProps) {
    super(props.id);
    this.props = props;
  }

  static create(
    codigo: string,
    anioRegistro: number,
    passwordHash: string,
  ): Usuario {
    const now = new Date();

    return new Usuario({
      id: randomUUID(),
      codigo,
      anioRegistro,
      rol: Usuario.resolveRol(codigo),
      passwordHash,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: UsuarioProps): Usuario {
    return new Usuario({
      ...props,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });
  }

  static isUvUserCode(codigo: string): boolean {
    return /^[123]\d*$/.test(codigo);
  }

  static resolveRol(codigo: string): UsuarioRol {
    if (!Usuario.isUvUserCode(codigo)) {
      throw new Error('Invalid UV user code');
    }

    if (codigo.startsWith('1')) return 'administrativo';
    if (codigo.startsWith('2')) return 'docente';
    if (codigo.startsWith('3')) return 'estudiante';

    throw new Error('Invalid user code prefix');
  }

  updateAccessData(codigo: string, anioRegistro: number): void {
    this.props.codigo = codigo;
    this.props.anioRegistro = anioRegistro;
    this.props.rol = Usuario.resolveRol(codigo);
    this.touch();
  }

  assignTemporaryPassword(passwordHash: string): void {
    this.props.passwordHash = passwordHash;
    this.props.mustChangePassword = true;
    this.touch();
  }

  changePassword(passwordHash: string): void {
    this.props.passwordHash = passwordHash;
    this.props.mustChangePassword = false;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
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

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get mustChangePassword(): boolean {
    return this.props.mustChangePassword;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

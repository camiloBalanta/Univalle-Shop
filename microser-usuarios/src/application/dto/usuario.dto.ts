export class CrearUsuarioDTO {
  codigo: string;
  anioRegistro: number;
  fullName?: string;
  email?: string;
  isActive?: boolean;
}

export class ActualizarUsuarioDTO {
  codigo?: string;
  anioRegistro?: number;
  fullName?: string;
  email?: string;
  isActive?: boolean;
}

export class UsuarioResponseDTO {
  id: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
  fullName: string;
  email: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SolicitarAccesoDTO {
  codigo: string;
  anioRegistro: number;
}

export class SolicitarAccesoResponseDTO {
  userId: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
  fullName: string;
  email: string;
  isActive: boolean;
  mustChangePassword: boolean;
  message: string;
  temporaryPassword: string;
}

export class LoginDTO {
  codigo: string;
  password: string;
}

export class LoginResponseDTO {
  userId: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
  mustChangePassword: boolean;
  message: string;
  token: string;
}

export class CambiarPasswordDTO {
  codigo: string;
  anioRegistro: number;
  currentPassword: string;
  newPassword: string;
}

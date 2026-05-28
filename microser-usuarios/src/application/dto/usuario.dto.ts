export class CrearUsuarioDTO {
  codigo: string;
  anioRegistro: number;
}

export class ActualizarUsuarioDTO {
  codigo?: string;
  anioRegistro?: number;
}

export class UsuarioResponseDTO {
  id: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
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
  mustChangePassword: boolean;
  message: string;
  temporaryPassword: string;
}

export class LoginDTO {
  codigo: string;
  anioRegistro: number;
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

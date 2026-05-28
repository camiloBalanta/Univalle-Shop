import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  CambiarPasswordDTO,
  LoginDTO,
  LoginResponseDTO,
  SolicitarAccesoDTO,
  SolicitarAccesoResponseDTO,
} from '../../application/dto/usuario.dto';
import { SolicitarAccesoUseCase } from '../../application/use-cases/solicitar-acceso.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { CambiarPasswordUseCase } from '../../application/use-cases/cambiar-password.use-case';
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly solicitarAccesoUseCase: SolicitarAccesoUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly cambiarPasswordUseCase: CambiarPasswordUseCase,
  ) {}

  @Post('solicitar-acceso')
  async solicitarAcceso(
    @Body() dto: SolicitarAccesoDTO,
  ): Promise<SolicitarAccesoResponseDTO> {
    try {
      return await this.solicitarAccesoUseCase.execute(dto);
    } catch (error) {
      if (error instanceof UsuarioDomainException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDTO): Promise<LoginResponseDTO> {
    try {
      return await this.loginUseCase.execute(dto);
    } catch (error) {
      if (error instanceof UsuarioDomainException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw error;
    }
  }

  @Post('cambiar-password')
  async cambiarPassword(@Body() dto: CambiarPasswordDTO): Promise<void> {
    try {
      await this.cambiarPasswordUseCase.execute(dto);
    } catch (error) {
      if (error instanceof UsuarioDomainException) {
        const status =
          error.code === 'WEAK_PASSWORD'
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.UNAUTHORIZED;

        throw new HttpException(error.message, status);
      }
      throw error;
    }
  }
}

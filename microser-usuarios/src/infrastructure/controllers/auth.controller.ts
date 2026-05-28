import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { LoginDTO, LoginResponseDTO } from '../../application/dto/usuario.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

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
}

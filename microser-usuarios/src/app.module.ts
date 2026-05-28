import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterProviderModule } from './infrastructure/providers/event-emitter.provider';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UsuarioController } from './infrastructure/controllers/usuario.controller';
import { MongoUsuarioRepository } from './infrastructure/persistence/repositories/mongo-usuario.repository';
import { CrearUsuarioUseCase } from './application/use-cases/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from './application/use-cases/actualizar-usuario.use-case';
import { EliminarUsuarioUseCase } from './application/use-cases/eliminar-usuario.use-case';
import { ObtenerUsuarioUseCase } from './application/use-cases/obtener-usuario.use-case';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios.use-case';
import { SolicitarAccesoUseCase } from './application/use-cases/solicitar-acceso.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { CambiarPasswordUseCase } from './application/use-cases/cambiar-password.use-case';
import { UsuarioApplicationService } from './application/services/usuario-application.service';
import { UsuarioSaga } from './application/sagas/usuario.saga';
import { PasswordService } from './infrastructure/security/password.service';
import { TokenService } from './infrastructure/security/token.service';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';


@Module({
  imports: [EventEmitterProviderModule],
  controllers: [AppController, UsuarioController, AuthController],
  providers: [
    AppService,
    // Application Layer
    CrearUsuarioUseCase,
    ActualizarUsuarioUseCase,
    EliminarUsuarioUseCase,
    ObtenerUsuarioUseCase,
    ListarUsuariosUseCase,
    SolicitarAccesoUseCase,
    LoginUseCase,
    CambiarPasswordUseCase,
    UsuarioApplicationService,
    PasswordService,
    TokenService,
    JwtAuthGuard,
    // Infrastructure Layer
    {
      provide: 'IUsuarioRepository',
      useClass: MongoUsuarioRepository,
    },
    // Sagas
    UsuarioSaga,
  ],
})
export class AppModule {}

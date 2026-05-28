import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UsuarioActualizado,
  UsuarioCreado,
  UsuarioEliminado,
} from '../../domain/events/usuario-events';

@Injectable()
export class UsuarioSaga {
  @OnEvent('usuario-creado')
  async handleUsuarioCreado(event: UsuarioCreado) {
    console.log(`
     [SAGA] Usuario creado
    |- ID: ${event.usuarioId}
    |- Codigo: ${event.codigo}
    |- Ano registro: ${event.anioRegistro}
    |- Rol: ${event.rol}
    |- Fecha: ${event.dateTimeOccurred.toISOString()}
    `);

    // Aqui pueden agregarse auditoria, notificaciones internas o sincronizacion.
  }

  @OnEvent('usuario-actualizado')
  async handleUsuarioActualizado(event: UsuarioActualizado) {
    console.log(`
    [SAGA] Usuario actualizado
    |- ID: ${event.usuarioId}
    |- Codigo: ${event.codigo}
    |- Ano registro: ${event.anioRegistro}
    |- Rol: ${event.rol}
    |- Fecha: ${event.dateTimeOccurred.toISOString()}
    `);
  }

  @OnEvent('usuario-eliminado')
  async handleUsuarioEliminado(event: UsuarioEliminado) {
    console.log(`
      [SAGA] Usuario eliminado
    |- ID: ${event.usuarioId}
    |- Fecha: ${event.dateTimeOccurred.toISOString()}
    `);
  }
}

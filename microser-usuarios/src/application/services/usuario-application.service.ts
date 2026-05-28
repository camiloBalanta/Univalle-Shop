import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { Usuario } from '../../domain/entities/usuario'

/**
 * Adaptador que implementa la persistencia AND publicación de eventos
 * Sigue el patrón Unit of Work + Event Sourcing
 */
@Injectable()
export class UsuarioApplicationService {
  constructor(
    @Inject('IUsuarioRepository') private usuarioRepository: IUsuarioRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Guarda el usuario y publica sus eventos de dominio
   */
  async saveAndPublishEvents(usuario: Usuario): Promise<void> {
    // Persistir
    await this.usuarioRepository.save(usuario);

    // Publicar eventos
    const events = usuario.events;
    for (const event of events) {
      const eventName = event.constructor.name;
      // Convertir camelCase a kebab-case
      // UsuarioCreado → usuario-creado
      const kebabName = eventName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase();

      this.eventEmitter.emit(kebabName, event);
    }

    // Limpiar eventos
    usuario.clearDomainEvents();
  }
}

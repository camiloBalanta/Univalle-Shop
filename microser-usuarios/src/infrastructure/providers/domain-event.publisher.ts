import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDomainEventPublisher } from '../../domain/ports/usuario-repository.port';
import { DomainEvent } from '../../domain/base-classes/domain-event';

@Injectable()
export class DomainEventPublisher implements IDomainEventPublisher {
  constructor(private eventEmitter: EventEmitter2) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventName = event.constructor.name;
      // Convertir camelCase a kebab-case para el nombre del evento
      const formattedEventName = eventName
        .replace(/([A-Z])/g, '.$1')
        .toLowerCase()
        .replace(/^\./, '')
        .replace(/\./g, '.');

      this.eventEmitter.emit(formattedEventName, event);
    }
  }
}

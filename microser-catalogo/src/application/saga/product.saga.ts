import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCreatedEvent } from '../../domain/events/product-created.event';
import { ProductUpdatedEvent } from '../../domain/events/product-updated.event';
import { ProductDeletedEvent } from '../../domain/events/product-deleted.event';
import { NotifyInventoryCommand } from '../commands/notify-inventory.command';
import { SyncCatalogCommand } from '../commands/sync-catalog.command';
import { CleanupProductCommand } from '../commands/cleanup-product.command';

@Injectable()
export class ProductSaga {
  @Saga()
  productCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(ProductCreatedEvent),
      map(
        (event: ProductCreatedEvent) =>
          new NotifyInventoryCommand(event.productId, event.name, event.price),
      ),
    );
  };

  @Saga()
  productUpdated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(ProductUpdatedEvent),
      map(
        (event: ProductUpdatedEvent) =>
          new SyncCatalogCommand(
            event.productId,
            event.changes.name,
            event.changes.price,
            event.changes.description,
          ),
      ),
    );
  };

  @Saga()
  productDeleted = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(ProductDeletedEvent),
      map(
        (event: ProductDeletedEvent) =>
          new CleanupProductCommand(event.productId),
      ),
    );
  };
}

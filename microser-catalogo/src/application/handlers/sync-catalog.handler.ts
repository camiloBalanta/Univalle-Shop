import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SyncCatalogCommand } from '../commands/sync-catalog.command';

@CommandHandler(SyncCatalogCommand)
export class SyncCatalogHandler implements ICommandHandler<SyncCatalogCommand> {
  async execute(command: SyncCatalogCommand): Promise<void> {
    console.log(`🔄 Sync catalog for product ${command.productId}`);
  }
}

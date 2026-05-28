import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CleanupProductCommand } from '../commands/cleanup-product.command';

@CommandHandler(CleanupProductCommand)
export class CleanupProductHandler implements ICommandHandler<CleanupProductCommand> {
  async execute(command: CleanupProductCommand): Promise<void> {
    console.log(
      `🧹 Cleanup resources for deleted product ${command.productId}`,
    );
  }
}

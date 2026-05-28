import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotifyInventoryCommand } from '../commands/notify-inventory.command';

@CommandHandler(NotifyInventoryCommand)
export class NotifyInventoryHandler implements ICommandHandler<NotifyInventoryCommand> {
  async execute(command: NotifyInventoryCommand): Promise<void> {
    console.log(
      `📦 Inventory notification triggered for product ${command.productId}`,
    );
  }
}

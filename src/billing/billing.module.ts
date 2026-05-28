import { Module } from '@nestjs/common';
import { ClientController } from './controllers/client.controller';
import { PlanController } from './controllers/plan.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { PaymentController } from './controllers/payment.controller';
import { ClientService } from './services/client.service';
import { PlanService } from './services/plan.service';
import { SubscriptionService } from './services/subscription.service';
import { PaymentService } from './services/payment.service';

@Module({
  controllers: [ClientController, PlanController, SubscriptionController, PaymentController],
  providers: [ClientService, PlanService, SubscriptionService, PaymentService]
})
export class BillingModule {}

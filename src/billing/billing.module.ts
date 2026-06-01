import { Module } from '@nestjs/common';
import { ClientController } from './controllers/client.controller';
import { PlanController } from './controllers/plan.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { PaymentController } from './controllers/payment.controller';
import { ClientService } from './services/client.service';
import { PlanService } from './services/plan.service';
import { SubscriptionService } from './services/subscription.service';
import { PaymentService } from './services/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { Payment } from './entities/payment.entity';
import { Person } from '@/auth/entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Plan, Subscription, Payment, Person])],
  exports: [TypeOrmModule],
  providers: [ClientService, PlanService, SubscriptionService, PaymentService],
  controllers: [ClientController, PlanController, SubscriptionController, PaymentController],
})
export class BillingModule {}

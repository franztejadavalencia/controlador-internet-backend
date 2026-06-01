import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from '@/billing/dto/create-subscription.dto';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}

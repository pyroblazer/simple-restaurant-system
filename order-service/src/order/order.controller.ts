import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { IsEmail, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

class PlaceOrderDto {
  @IsEmail() customerEmail: string;
  @IsArray() @ArrayNotEmpty() @IsString({ each: true }) menuItems: string[];
}

@Controller()
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get('menu')
  @HttpCode(HttpStatus.OK)
  getMenu() {
    return this.service.getMenu();
  }

  @Post('order')
  @HttpCode(HttpStatus.CREATED)
  placeOrder(@Body() dto: PlaceOrderDto) {
    return this.service.placeOrder(dto);
  }

  @Get('order/:id')
  @HttpCode(HttpStatus.OK)
  getOrder(@Param('id') id: string) {
    return this.service.getOrderStatus(id);
  }
}

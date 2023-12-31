import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiResponse({ status: 201, description: 'Product was created', type: Product })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, Token related' })
  create( 
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.create( createProductDto, user );
  }

  @Get()
  @ApiResponse({ status: 201, description: 'List product was find it' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, Token related' })
  findAll( @Query() paginationDto: PaginationDto ) {
    return this.productsService.findAll( paginationDto );
  }

  @Get(':term')
  @ApiResponse({ status: 201, description: 'Product was find it', type: Product })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, Token related' })
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain( term );
  }

  @Patch(':id')
  @ApiResponse({ status: 201, description: 'Product was updated', type: Product })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, Token related' })
  update(
    @Param( 'id', ParseUUIDPipe ) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.update( id, updateProductDto, user );
  }

  @Delete(':id')
  @ApiResponse({ status: 201, description: 'Product was deleted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbiden, Token related' })
  remove(@Param( 'id', ParseUUIDPipe ) id: string ) {
    return this.productsService.remove( id );
  }
}

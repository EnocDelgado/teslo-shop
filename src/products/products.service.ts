import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toBindingIdentifierName } from '@babel/types';
import { NotFoundError } from 'rxjs';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(

    @InjectRepository( Product )
    private readonly productRepository: Repository<Product>,

  ){}
  

  async create(createProductDto: CreateProductDto) {
  
    try {
      
      // ceate product
      const product = this.productRepository.create( createProductDto );
      // svae product
      await this.productRepository.save( product );

      return product;

    } catch ( error ) {

      this.handleDBExeptions( error );
    }
  }
  

  findAll( paginationDto: PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset
    });
  }


  async findOne(term: string) {
    
    let product: Product;

    if ( isUUID( term ) ) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      
      const queryBuilder = await this.productRepository.createQueryBuilder();
      // way to not recibe dependecy injection
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne()
    }
    
    //validattion
    if ( !product )
      throw new NotFoundException(`Proudct with id ${ term } not found!`)

    return product;
  }


  async update(id: string, updateProductDto: UpdateProductDto) {
    
    //looking for id
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    //validattion
    if ( !product )
      throw new NotFoundException(`Proudct with id ${ id } not found!`);

    try {

      await this.productRepository.save( product );

      return product;

    } catch ( error ) {

      this.handleDBExeptions( error );
    }
  }


  async remove(id: string) {

    const product = await this.productRepository.findOneBy({ id });

    await this.productRepository.remove( product );

   return product;
  }


  // Error handle
  private handleDBExeptions( error: any ) {

    if ( error.code === '23505' )
        throw new BadRequestException( error.detail );

      this.logger.error( error  );
      throw new InternalServerErrorException('Unexpected error, check server logs!')
  }
}

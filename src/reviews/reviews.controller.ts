import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async getAllReviews() {
    return this.reviewsService.getAllReviews();
  }

  @Get(':id')
  async getReviewByTheId(@Param('id') _id: string) {
    return this.reviewsService.getReviewById(_id);
  }

  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Put(':id')
  async updateReview(
    @Param('id') _id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(_id, updateReviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(@Param('id') _id: string) {
    await this.reviewsService.deleteReview(_id);
  }
}
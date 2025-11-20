import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.schema';

@Injectable()
export class ReviewsService {

  constructor(@Inject('REVIEW_MODEL') private reviewModel: Model<Review>) { }

  async getAllReviews(): Promise<Review[]> {
    return await this.reviewModel.find().exec();
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException(`La reseña con ID ${id} no fue encontrada`);
    }
    return review;
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const newReview = new this.reviewModel(createReviewDto);
    return await newReview.save();
  }

  async updateReview(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, { $set: updateReviewDto }, { new: true })
      .exec();

    if (!updatedReview) {
      throw new NotFoundException(`La reseña con ID ${id} no fue encontrada para actualizar`);
    }
    return updatedReview;
  }

  async deleteReview(id: string): Promise<Review> {
    const deletedReview = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!deletedReview) {
      throw new NotFoundException(`La reseña con ID ${id} no fue encontrada para eliminar`);
    }
    return deletedReview;
  }
}
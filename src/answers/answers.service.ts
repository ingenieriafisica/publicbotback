import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.schema';

@Injectable()
export class AnswersService {
  constructor(@Inject('ANSWERS_MODEL') private answerModel: Model<Answer>) {}

  async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
    const newAnswer = new this.answerModel(createAnswerDto);
    return await newAnswer.save();
  }

  async findAll(): Promise<Answer[]> {
    return await this.answerModel.find().exec();
  }

  async findOne(id: string): Promise<Answer> {
    const answer = await this.answerModel.findOne({ id }).exec();
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }
    return answer;
  }

  async update(id: string, updateAnswerDto: UpdateAnswerDto): Promise<Answer> {
    const updatedAnswer = await this.answerModel.findOneAndUpdate({ id }, updateAnswerDto, { new: true }).exec();
    if (!updatedAnswer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }
    return updatedAnswer;
  }

  async remove(id: string): Promise<Answer> {
    const deletedAnswer = await this.answerModel.findOneAndDelete({ id }).exec();
    if (!deletedAnswer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }
    return deletedAnswer;
  }
}

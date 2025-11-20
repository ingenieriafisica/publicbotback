import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.schema';
import { JwtGuard } from 'src/auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  async createAnswer(@Body() createAnswerDto: CreateAnswerDto): Promise<Answer> {
    return this.answersService.create(createAnswerDto);
  }

  @Get()
  async getAllAnswers(): Promise<Answer[]> {
    return this.answersService.findAll();
  }

  @Get(':id')
  async getAnswerById(@Param('id') id: string): Promise<Answer> {
    return this.answersService.findOne(id);
  }

  @Patch(':id')
  async updateAnswer(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto): Promise<Answer> {
    return this.answersService.update(id, updateAnswerDto);
  }

  @Delete(':id')
  async deleteAnswer(@Param('id') id: string): Promise<Answer> {
    return this.answersService.remove(id);
  }
}

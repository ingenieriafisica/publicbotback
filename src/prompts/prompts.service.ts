import { Injectable, Inject } from '@nestjs/common';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { Model } from 'mongoose';
import { Prompt } from './entities/prompt.schema';

@Injectable()
export class PromptsService {
  constructor(@Inject('PROMPTS_MODEL') private promptModel: Model<Prompt>) {}

  // Crear un nuevo prompt
  async create(createPromptDto: CreatePromptDto): Promise<Prompt> {
    // Crear una instancia del modelo con los datos del DTO
    const newPrompt = new this.promptModel(createPromptDto);
    
    // Guardar el Prompt en MongoDB
    return await newPrompt.save();
  }

  // Devolver todos los prompts
  async findAll(): Promise<Prompt[]> {
    return this.promptModel.find().exec();  // Devolver todos los prompts almacenados
  }

  // Devolver un prompt específico por ID
  async findOne(id: string): Promise<Prompt | null> {
    return this.promptModel.findById(id).exec();  // Buscar un prompt por su ID
  }

  // Actualizar un prompt específico por ID
  async update(id: string, updatePromptDto: UpdatePromptDto): Promise<Prompt | null> {
    return this.promptModel.findByIdAndUpdate(id, updatePromptDto, {
      new: true,  // Devolver el documento actualizado
    }).exec();
  }

  // Eliminar un prompt por ID
  async remove(id: string): Promise<Prompt | null> {
    return this.promptModel.findByIdAndDelete(id).exec();  // Eliminar un prompt por su ID
  }
}
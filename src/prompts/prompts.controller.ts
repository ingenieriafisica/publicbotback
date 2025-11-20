import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, HttpCode } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { Prompt } from './entities/prompt.schema';

@Controller('prompts')
export class PromptsController {

constructor(private readonly promptsService: PromptsService) { }

    @Post()
    @HttpCode(201)
    async create(@Body() createPromptDto: CreatePromptDto): Promise<Prompt> {
        return this.promptsService.create(createPromptDto);
    }

    @Get()
    async findAll(): Promise<Prompt[]> {
        return this.promptsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Prompt> {
        const prompt = await this.promptsService.findOne(id);
        if (!prompt) {
            throw new NotFoundException(`No se encontró el prompt con ID ${id}.`);
        }
        return prompt;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePromptDto: UpdatePromptDto): Promise<Prompt> {
        const updatedPrompt = await this.promptsService.update(id, updatePromptDto);
        if (!updatedPrompt) {
            throw new NotFoundException(`No se encontró el prompt con ID ${id} o no se pudo actualizar.`);
        }
        return updatedPrompt;
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<Prompt> {
        const deletedPrompt = await this.promptsService.remove(id);
        if (!deletedPrompt) {
            throw new NotFoundException(`No se encontró el prompt con ID ${id} y no se pudo eliminar.`);
        }
        return deletedPrompt;
    }
}
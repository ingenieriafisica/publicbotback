import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappapiController } from './whatsappapi.controller';
import { WhatsappapiService } from './whatsappapi.service';

describe('WhatsappapiController', () => {
  let controller: WhatsappapiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappapiController],
      providers: [WhatsappapiService],
    }).compile();

    controller = module.get<WhatsappapiController>(WhatsappapiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

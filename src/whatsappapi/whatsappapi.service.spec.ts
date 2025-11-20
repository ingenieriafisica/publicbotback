import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappapiService } from './whatsappapi.service';

describe('WhatsappapiService', () => {
  let service: WhatsappapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappapiService],
    }).compile();

    service = module.get<WhatsappapiService>(WhatsappapiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

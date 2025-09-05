import { Test, TestingModule } from '@nestjs/testing';
import { CoachServiceController } from './coach-service.controller';
import { CoachServiceService } from './coach-service.service';

describe('CoachServiceController', () => {
  let coachServiceController: CoachServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoachServiceController],
      providers: [CoachServiceService],
    }).compile();

    coachServiceController = app.get<CoachServiceController>(CoachServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(coachServiceController.getHello()).toBe('Hello World!');
    });
  });
});

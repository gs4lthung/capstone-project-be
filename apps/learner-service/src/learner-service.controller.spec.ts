import { Test, TestingModule } from '@nestjs/testing';
import { LearnerServiceController } from './learner-service.controller';
import { LearnerServiceService } from './learner-service.service';

describe('LearnerServiceController', () => {
  let learnerServiceController: LearnerServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LearnerServiceController],
      providers: [LearnerServiceService],
    }).compile();

    learnerServiceController = app.get<LearnerServiceController>(LearnerServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(learnerServiceController.getHello()).toBe('Hello World!');
    });
  });
});

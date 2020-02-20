import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from './history.controller';

describe('History Controller', () => {
	let controller: HistoryController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ HistoryController ]
		}).compile();

		controller = module.get<HistoryController>(HistoryController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});

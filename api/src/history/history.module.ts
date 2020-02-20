import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { ConfigModule } from '../config.module';

@Module({
	imports: [ ConfigModule ],
	controllers: [ HistoryController ],
	providers: [ HistoryService ]
})
export class HistoryModule {}

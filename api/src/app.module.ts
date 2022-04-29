import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssigneesModule } from './assignees/assignees.module';
import { CompletionModule } from './completion/completion.module';
import { HistoryModule } from './history/history.module';
import { CachedaysModule } from './cachedays/cachedays.module';
import { TeamsModule } from './teams/teams.module';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';

import { AuthenticationMiddleware } from './auth/authentication.middleware';

@Module({
  imports: [
    AssigneesModule,
    CompletionModule,
    HistoryModule,
    CachedaysModule,
    TeamsModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  auth0Disabled: boolean;

  constructor(config: ConfigService) {
    this.auth0Disabled = JSON.parse(config.get('AUTH0_DISABLED')); // Trick to convert string to boolean
  }

  public configure(consumer: MiddlewareConsumer) {
    if (this.auth0Disabled !== true) {
      consumer
        .apply(AuthenticationMiddleware)
        .forRoutes(
          { path: '/completion', method: RequestMethod.GET },
          { path: '/history', method: RequestMethod.GET },
          { path: '/teams', method: RequestMethod.GET },
          { path: '/cachedays', method: RequestMethod.DELETE },
        );
    }
  }
}

import { NestMiddleware, Injectable } from '@nestjs/common';
import * as jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { ConfigService } from '../config.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  auth0Domain: string;
  auth0Audience: string;

  constructor(config: ConfigService) {
    this.auth0Domain = config.get('AUTH0_DOMAIN');
    this.auth0Audience = config.get('AUTH0_AUDIENCE');
  }

  use(req, res, next) {
    jwt({
      secret: expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${this.auth0Domain}/.well-known/jwks.json`,
      }),

      audience: this.auth0Audience,
      issuer: `https://${this.auth0Domain}/`,
      algorithm: 'RS256',
    })(req, res, err => {
      if (err) {
        const status = err.status || 500;
        const message =
          err.message || 'Sorry, we were unable to process your request.';
        return res.status(status).send({
          message,
        });
      }
      next();
    });
  }
}

import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
    }
  }
}

import type { UserAccess } from "../../../shared/access.js";

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        jobTitle: string;
        access: UserAccess;
        isAdmin: boolean;
        createdAt: string;
      };
    }
  }
}

export {};

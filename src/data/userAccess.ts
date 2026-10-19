export {
  EMPTY_USER_ACCESS,
  isPermissionModule,
  normalizeUserAccess,
  PERMISSION_MODULES,
} from "../../shared/access";
export type {
  ModulePermission,
  PermissionModule,
  UserAccess,
} from "../../shared/access";

import type { UserAccess } from "../../shared/access";

export type ManagedUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  jobTitle: string;
  access: UserAccess;
  isAdmin: boolean;
  createdAt: string;
};

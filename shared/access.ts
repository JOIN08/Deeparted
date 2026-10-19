export const PERMISSION_MODULES = [
  {
    name: "Vessels",
    description: "View fleet records or manage ships and deck layouts.",
  },
  {
    name: "Voyages",
    description: "View schedules or manage voyages, fares, and cancellations.",
  },
  {
    name: "Ports Manager",
    description: "View ports or add and remove port locations.",
  },
  {
    name: "Routes",
    description: "View routes or create and delete routes.",
  },
  {
    name: "Reports",
    description: "View reports or create and edit report templates.",
  },
  {
    name: "Users",
    description: "View user accounts or create and remove accounts.",
  },
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number]["name"];

export type ModulePermission = {
  view: boolean;
  edit: boolean;
};

export type UserAccess = Record<PermissionModule, ModulePermission>;

export const EMPTY_USER_ACCESS: UserAccess = Object.fromEntries(
  PERMISSION_MODULES.map(({ name }) => [
    name,
    { view: false, edit: false },
  ]),
) as UserAccess;

export function isPermissionModule(name: string): name is PermissionModule {
  return PERMISSION_MODULES.some((module) => module.name === name);
}

function normalizeModulePermission(value: unknown): ModulePermission {
  if (typeof value === "boolean") {
    return { view: value, edit: value };
  }
  if (!value || typeof value !== "object") {
    return { view: false, edit: false };
  }

  const permission = value as Partial<ModulePermission>;
  const edit = permission.edit === true;
  return {
    view: permission.view === true || edit,
    edit,
  };
}

export function normalizeUserAccess(value: unknown): UserAccess {
  const source =
    value && typeof value === "object"
      ? (value as Partial<Record<PermissionModule, unknown>>)
      : {};

  return Object.fromEntries(
    PERMISSION_MODULES.map(({ name }) => [
      name,
      normalizeModulePermission(source[name]),
    ]),
  ) as UserAccess;
}

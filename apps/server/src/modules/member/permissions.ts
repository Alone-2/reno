import type { ProjectPermission } from "@reno/db";

export const ALL_PROJECT_PERMISSIONS: ProjectPermission[] = [
  "view",
  "project.manage",
  "member.manage",
  "file.manage",
  "progress.write",
  "finance.write",
  "finance.approve",
  "acceptance.write",
];

export const PROJECT_ROLE_PERMISSIONS = {
  owner: ALL_PROJECT_PERMISSIONS,
  contractor: ["view", "file.manage", "progress.write", "finance.write", "acceptance.write"],
  designer: ["view", "file.manage", "progress.write"],
  supervisor: ["view", "file.manage", "progress.write", "acceptance.write"],
  property: ["view", "file.manage", "acceptance.write"],
  family: ["view", "file.manage", "finance.approve", "acceptance.write"],
  viewer: ["view"],
} satisfies Record<string, ProjectPermission[]>;

export type ProjectMemberRole = keyof typeof PROJECT_ROLE_PERMISSIONS;

export function permissionsForRole(role: ProjectMemberRole): ProjectPermission[] {
  return [...PROJECT_ROLE_PERMISSIONS[role]];
}

export function hasProjectPermission(
  permissions: readonly ProjectPermission[],
  required: ProjectPermission,
): boolean {
  return permissions.includes(required);
}

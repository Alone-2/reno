import { and, eq } from "drizzle-orm";
import {
  db,
  projectMember,
  renovationProject,
  user,
  type ProjectPermission,
} from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import { createNotification } from "../notification/service";
import {
  ALL_PROJECT_PERMISSIONS,
  hasProjectPermission,
  permissionsForRole,
  type ProjectMemberRole,
} from "./permissions";

export interface ProjectAccess {
  projectId: string;
  role: ProjectMemberRole | "admin";
  permissions: ProjectPermission[];
  isOwner: boolean;
}

export async function getProjectAccess(
  userId: string,
  globalRole: string,
  projectId: string,
): Promise<ProjectAccess | null> {
  if (globalRole === "admin") {
    return { projectId, role: "admin", permissions: ALL_PROJECT_PERMISSIONS, isOwner: false };
  }

  const [project] = await db
    .select({ ownerId: renovationProject.ownerId })
    .from(renovationProject)
    .where(eq(renovationProject.id, projectId))
    .limit(1);
  if (!project) return null;
  if (project.ownerId === userId) {
    return { projectId, role: "owner", permissions: ALL_PROJECT_PERMISSIONS, isOwner: true };
  }

  const [member] = await db
    .select({ role: projectMember.role, permissions: projectMember.permissions })
    .from(projectMember)
    .where(and(eq(projectMember.projectId, projectId), eq(projectMember.userId, userId)))
    .limit(1);
  if (!member) return null;
  return {
    projectId,
    role: member.role,
    permissions: member.permissions as ProjectPermission[],
    isOwner: false,
  };
}

export async function canAccessProject(
  userId: string,
  globalRole: string,
  projectId: string,
  permission: ProjectPermission = "view",
) {
  const access = await getProjectAccess(userId, globalRole, projectId);
  return Boolean(access && hasProjectPermission(access.permissions, permission));
}

export async function listProjectMembers(projectId: string) {
  return db
    .select({
      id: projectMember.id,
      projectId: projectMember.projectId,
      userId: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      role: projectMember.role,
      permissions: projectMember.permissions,
      joinedAt: projectMember.joinedAt,
    })
    .from(projectMember)
    .innerJoin(user, eq(projectMember.userId, user.id))
    .where(eq(projectMember.projectId, projectId));
}

export async function inviteProjectMember(
  projectId: string,
  username: string,
  role: Exclude<ProjectMemberRole, "owner">,
  invitedBy: string,
) {
  const [target] = await db.select().from(user).where(eq(user.username, username)).limit(1);
  if (!target) return { error: ErrorCode.NOT_FOUND };

  const [member] = await db
    .insert(projectMember)
    .values({
      projectId,
      userId: target.id,
      role,
      permissions: permissionsForRole(role),
      invitedBy,
    } as any)
    .onConflictDoUpdate({
      target: [projectMember.projectId, projectMember.userId],
      set: { role, permissions: permissionsForRole(role), updatedAt: new Date() } as any,
    })
    .returning();

  await createNotification({
    userId: target.id,
    projectId,
    type: "project_invite",
    title: "你已加入装修项目",
    content: `项目角色：${role}`,
    href: "/members",
    channel: "in_app",
  });
  return { member };
}

export async function updateProjectMemberRole(
  projectId: string,
  memberId: string,
  role: Exclude<ProjectMemberRole, "owner">,
) {
  const [updated] = await db
    .update(projectMember)
    .set({ role, permissions: permissionsForRole(role), updatedAt: new Date() } as any)
    .where(and(eq(projectMember.id, memberId), eq(projectMember.projectId, projectId)))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { member: updated };
}

export async function removeProjectMember(projectId: string, memberId: string) {
  const [deleted] = await db
    .delete(projectMember)
    .where(and(eq(projectMember.id, memberId), eq(projectMember.projectId, projectId)))
    .returning({ id: projectMember.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}

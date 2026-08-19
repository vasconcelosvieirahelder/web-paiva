export type ProfileRole = "visitor" | "advertiser" | "admin";

const roleLabels: Record<ProfileRole, string> = {
  visitor: "Visitante",
  advertiser: "Anunciante",
  admin: "Administrador",
};

export function formatProfileRole(role: string | null | undefined) {
  if (role === "advertiser" || role === "admin" || role === "visitor") {
    return roleLabels[role];
  }

  return roleLabels.visitor;
}

export function canAccessAdvertiserSetup(role: string | null | undefined) {
  return role === "advertiser" || role === "admin";
}


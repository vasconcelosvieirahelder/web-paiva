export type ModerationAction = "approve" | "reject" | "suspend";

export type ModeratedListingStatus = "approved" | "rejected" | "suspended";

export type ModeratedAdvertiserStatus = "active" | "draft" | "suspended";

const moderationActions = ["approve", "reject", "suspend"] as const;

const listingStatusByAction: Record<ModerationAction, ModeratedListingStatus> = {
  approve: "approved",
  reject: "rejected",
  suspend: "suspended",
};

const advertiserStatusByAction: Record<ModerationAction, ModeratedAdvertiserStatus> = {
  approve: "active",
  reject: "draft",
  suspend: "suspended",
};

export function isModerationAction(action: string): action is ModerationAction {
  return moderationActions.includes(action as ModerationAction);
}

export function getListingStatusForModerationAction(action: ModerationAction) {
  return listingStatusByAction[action];
}

export function getAdvertiserStatusForModerationAction(action: ModerationAction) {
  return advertiserStatusByAction[action];
}

export function getModerationEventAction(action: ModerationAction) {
  return listingStatusByAction[action];
}

export function isListingAdvertiserProfileOwnershipConsistent({
  advertiserProfileOwnerId,
  listingOwnerId,
}: {
  advertiserProfileOwnerId: string | null | undefined;
  listingOwnerId: string | null | undefined;
}) {
  return Boolean(listingOwnerId && advertiserProfileOwnerId && listingOwnerId === advertiserProfileOwnerId);
}

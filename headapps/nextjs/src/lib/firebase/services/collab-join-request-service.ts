import type { JoinRequestStatus } from 'lib/collab-sites/collab-site.types';
import { log } from 'src/util/helpers/log-helper';
import { firestoreRepository } from '../repositories/firestore-repository';
import { FieldValue } from '../config';
import { FIRESTORE_COLLECTIONS } from '../types';

// ---------------------------------------------------------------------------
// Firestore document shape
// ---------------------------------------------------------------------------

/**
 * Lifecycle states stored on the Firestore doc. Wider than the UI-facing
 * `JoinRequestStatus` so we can record post-approval state for audit/cleanup
 * without exposing it to the UI (the explore-list UI only differentiates
 * `pending` vs everything-else).
 */
type JoinRequestDocStatus = 'pending' | 'approved';

type JoinRequestDocument = {
  userEmail: string;
  collabSiteId: string;
  collabSiteName: string;
  status: JoinRequestDocStatus;
  requestedAt: ReturnType<typeof FieldValue.serverTimestamp> | Date;
  approvedAt?: ReturnType<typeof FieldValue.serverTimestamp> | Date;
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Join Request Service
 * Server-side persistence for collab site join request state.
 * Document ID convention: `{userEmail}_{collabSiteId}`
 */
class JoinRequestService {
  private readonly collectionPath = FIRESTORE_COLLECTIONS.JOINREQUESTS;

  /** Build a deterministic document ID for a user + collab site pair.
   * Replaces forward slashes in collabSiteId (Sitecore paths) with '|'
   * since Firestore document IDs cannot contain forward slashes. */
  private docId(userEmail: string, collabSiteId: string): string {
    return `${userEmail}_${collabSiteId.replace(/\//g, '|')}`;
  }

  /** Check whether a pending join request exists for a single collab site. */
  async getStatus(userEmail: string, collabSiteId: string): Promise<JoinRequestStatus> {
    const doc = await firestoreRepository.get<JoinRequestDocument>(
      this.collectionPath,
      this.docId(userEmail, collabSiteId)
    );
    return doc?.data?.status === 'pending' ? 'pending' : 'none';
  }

  /**
   * Batch-check pending status for multiple collab sites.
   * Returns a map of collabSiteId -> JoinRequestStatus.
   */
  async getStatusBatch(
    userEmail: string,
    collabSiteIds: string[]
  ): Promise<Record<string, JoinRequestStatus>> {
    const entries = await Promise.all(
      collabSiteIds.map(async (collabSiteId) => {
        const status = await this.getStatus(userEmail, collabSiteId);
        return [collabSiteId, status] as const;
      })
    );
    return Object.fromEntries(entries);
  }

  /** Create or overwrite a join request as pending. */
  async createRequest(
    userEmail: string,
    collabSiteId: string,
    collabSiteName: string
  ): Promise<void> {
    const data: JoinRequestDocument = {
      userEmail,
      collabSiteId,
      collabSiteName,
      status: 'pending',
      requestedAt: FieldValue.serverTimestamp(),
    };

    await firestoreRepository.set(this.collectionPath, this.docId(userEmail, collabSiteId), data);

    log('INFO', 'collab-join-request-service', 'Join request created', {
      userEmail,
      collabSiteId,
      collabSiteName,
    });
  }

  /** Check if a pending request already exists (convenience wrapper). */
  async hasPendingRequest(userEmail: string, collabSiteId: string): Promise<boolean> {
    return (await this.getStatus(userEmail, collabSiteId)) === 'pending';
  }

  /**
   * Transition any `pending` join requests for `userEmail` to `approved` for
   * the given `collabSiteIds` (typically the user's now-confirmed memberships).
   * Idempotent: docs that are absent or already `approved` are skipped.
   *
   * Uses a single `where(userEmail)` query (Firestore auto-indexes single-field
   * equality) so we don't issue one read per site, then writes in parallel only
   * for docs that actually need transitioning.
   */
  async markApproved(userEmail: string, collabSiteIds: string[]): Promise<void> {
    if (!collabSiteIds.length) return;

    const memberSiteIds = new Set(collabSiteIds);

    let userDocs;
    try {
      userDocs = await firestoreRepository.getAll<JoinRequestDocument>(this.collectionPath, {
        where: [{ field: 'userEmail', operator: '==', value: userEmail }],
      });
    } catch (error) {
      log('WARNING', 'collab-join-request-service', 'Failed to query join requests for approval', {
        userEmail,
        error: String(error),
      });
      return;
    }

    const toApprove = userDocs.filter(
      (doc) => doc.data.status === 'pending' && memberSiteIds.has(doc.data.collabSiteId)
    );

    if (!toApprove.length) return;

    await Promise.all(
      toApprove.map((doc) =>
        firestoreRepository
          .update<Partial<JoinRequestDocument>>(this.collectionPath, doc.id, {
            status: 'approved',
            approvedAt: FieldValue.serverTimestamp(),
          })
          .catch((error) =>
            log('WARNING', 'collab-join-request-service', 'Failed to mark join request approved', {
              userEmail,
              docId: doc.id,
              error: String(error),
            })
          )
      )
    );

    log('INFO', 'collab-join-request-service', 'Marked join requests approved', {
      userEmail,
      count: toApprove.length,
      collabSiteIds: toApprove.map((d) => d.data.collabSiteId),
    });
  }
}

export const joinRequestService = new JoinRequestService();

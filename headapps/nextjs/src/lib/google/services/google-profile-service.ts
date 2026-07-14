import type { GoogleProfileData, OrgTreeNode } from 'ts/google';
import { admin, type admin_directory_v1 } from '@googleapis/admin';
import { getServiceAccountClient } from 'lib/auth/google-client';
import { getRedisClient } from 'lib/cache/redis';

const DIRECTORY_USER_READONLY_SCOPE =
  'https://www.googleapis.com/auth/admin.directory.user.readonly';

/**
 * Service for fetching and caching Google Profile data via the Admin Directory API.
 * Uses a service account with domain-wide delegation — no user OAuth token required.
 */
const PROFILE_CACHE_PREFIX = 'google:profile';
const CACHE_TTL_SECONDS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 15 : 15 * 60; // local: 15s TTL for easy testing, prod: 15 minutes

class GoogleProfileService {
  // Concurrency limiter for Directory API calls (10 QPS limit, keep 2 headroom)
  private activeRequests = 0;
  private readonly MAX_CONCURRENT = 8;
  private requestQueue: Array<() => void> = [];

  /**
   * Log helper for structured JSON logging
   */
  private logCustom(
    level: 'INFO' | 'ERROR' | 'WARN',
    message: string,
    data?: Record<string, unknown>
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      severity: level,
      message,
      ...data,
    };
    if (level === 'ERROR') {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Fetch Google profile from the Admin Directory API with caching.
   * Retrieves standard profile fields plus custom workspace schema data (User_Info).
   * @param userEmail The user's primary Google Workspace email address
   * @param options Optional projection and customFieldMask for the Directory API call
   * @returns GoogleProfileData or null on error
   */
  async fetchExtendedProfile(
    userEmail: string,
    options?: { projection?: 'basic' | 'custom' | 'full'; customFieldMask?: string }
  ): Promise<GoogleProfileData | null> {
    const projection = options?.projection ?? 'full';
    const customFieldMask = options?.customFieldMask ?? 'User_Info';

    try {
      // Check cache first (skip cache for non-default projections to avoid stale partial data)
      const isDefaultProjection = projection === 'full' && customFieldMask === 'User_Info';
      if (isDefaultProjection) {
        const cachedProfile = await this.getFromProfileCache(userEmail);
        if (cachedProfile) {
          this.logCustom('INFO', 'Google extended profile returned from cache', { userEmail });
          return cachedProfile;
        } else {
          this.logCustom('INFO', 'Google extended profile cache miss', { userEmail });
        }
      }

      // Create service account client with domain-wide delegation
      const jwtClient = getServiceAccountClient({
        scopes: [DIRECTORY_USER_READONLY_SCOPE],
      });

      const directoryClient = admin({
        version: 'directory_v1',
        auth: jwtClient,
      });

      // Fetch user data with the requested projection
      const response = await directoryClient.users.get({
        userKey: userEmail,
        projection,
        customFieldMask: projection === 'custom' ? customFieldMask : undefined,
      });

      const user = response.data;
      const profileData = this.mapToGoogleProfileData(user);

      // Cache the results (only for default projection)
      if (isDefaultProjection) {
        await this.setProfileCache(userEmail, profileData);
      }
      this.logCustom('INFO', 'Google extended profile fetched and cached', {
        profileId: profileData.id,
        hasUserInfo: !!profileData.userInfo,
      });

      return profileData;
    } catch (error) {
      this.logCustom('ERROR', 'Failed to fetch Google extended profile', {
        userEmail,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return null;
    }
  }

  /**
   * Maps an Admin Directory API user response to GoogleProfileData,
   * including the User_Info custom workspace schema.
   */
  private mapToGoogleProfileData(user: admin_directory_v1.Schema$User): GoogleProfileData {
    const userInfoSchema = user.customSchemas?.['User_Info'] as Record<string, unknown> | undefined;

    const phones = user.phones as Array<{ value?: string; type?: string }> | undefined;

    const organizations = user.organizations as
      | Array<{ name?: string; title?: string; department?: string; location?: string }>
      | undefined;

    const addresses = user.addresses as
      | Array<{ formatted?: string; type?: string; region?: string }>
      | undefined;

    const relations = user.relations as Array<{ value?: string; type?: string }> | undefined;

    const languages = user.languages as
      | Array<{ languageCode?: string; preference?: string }>
      | undefined;

    const locations = user.locations as
      | Array<{
          type?: string;
          area?: string;
          buildingId?: string;
          floorName?: string;
          floorSection?: string;
          deskCode?: string;
        }>
      | undefined;

    return {
      id: user.id || '',
      primaryEmail: user.primaryEmail || undefined,
      name: user.name
        ? {
            displayName: user.name.fullName || undefined,
            givenName: user.name.givenName || undefined,
            familyName: user.name.familyName || undefined,
          }
        : undefined,
      suspended: user.suspended ?? undefined,
      archived: user.archived ?? undefined,
      isAdmin: user.isAdmin ?? undefined,
      isDelegatedAdmin: user.isDelegatedAdmin ?? undefined,
      isGuestUser: (user as { isGuestUser?: boolean }).isGuestUser ?? undefined,
      creationTime: user.creationTime || undefined,
      lastLoginTime: user.lastLoginTime || undefined,
      orgUnitPath: user.orgUnitPath || undefined,
      emailAddresses: user.primaryEmail ? [{ value: user.primaryEmail, type: 'work' }] : undefined,
      phoneNumbers: phones?.map((phone) => ({
        value: phone.value || '',
        type: phone.type || undefined,
      })),
      photos: user.thumbnailPhotoUrl ? [{ url: user.thumbnailPhotoUrl }] : undefined,
      organizations: organizations?.map((org) => ({
        name: org.name || undefined,
        title: org.title || undefined,
        department: org.department || undefined,
        location: org.location || undefined,
      })),
      relations: relations?.map((rel) => ({
        value: rel.value || undefined,
        type: rel.type || undefined,
      })),
      addresses: addresses?.map((address) => ({
        formattedValue: address.formatted || undefined,
        type: address.type || undefined,
        region: address.region || undefined,
      })),
      languages: languages?.map((lang) => ({
        languageCode: lang.languageCode || undefined,
        preference: lang.preference || undefined,
      })),
      locations: locations?.map((loc) => ({
        type: loc.type || undefined,
        area: loc.area || undefined,
        buildingId: loc.buildingId || undefined,
        floorName: loc.floorName || undefined,
        floorSection: loc.floorSection || undefined,
        deskCode: loc.deskCode || undefined,
      })),
      customSchemas: user.customSchemas as
        | Record<string, Record<string, unknown> | undefined>
        | undefined,
      userInfo: userInfoSchema
        ? {
            companyCode: String(userInfoSchema['Company_Code'] ?? ''),
            businessUnit: Number(userInfoSchema['Business_Unit'] ?? 0),
            businessUnitDescription: String(userInfoSchema['Business_Unit_Description'] ?? ''),
            employeeClass: String(userInfoSchema['Employee_Class'] ?? ''),
            employeeNumber: String(userInfoSchema['Employee_Number'] ?? ''),
            isManager: String(userInfoSchema['Is_Manager'] ?? ''),
            managerLevel: Number(userInfoSchema['Manager_Level'] ?? 0),
            workLocationCode: String(userInfoSchema['Work_Location_Code'] ?? ''),
            city: String(userInfoSchema['City'] ?? ''),
            state: String(userInfoSchema['State'] ?? ''),
          }
        : undefined,
    };
  }

  /**
   * Get cached profile from Redis if present
   */
  private async getFromProfileCache(key: string): Promise<GoogleProfileData | null> {
    try {
      const redis = await getRedisClient();
      const raw = await redis.get(`${PROFILE_CACHE_PREFIX}:${key}`);
      if (raw) {
        return JSON.parse(raw) as GoogleProfileData;
      }
    } catch (error) {
      this.logCustom('WARN', 'Redis profile cache read failed, treating as miss', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }

  /**
   * Cache profile data in Redis with TTL
   */
  private async setProfileCache(key: string, data: GoogleProfileData): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.set(
        `${PROFILE_CACHE_PREFIX}:${key}`,
        JSON.stringify(data),
        'EX',
        CACHE_TTL_SECONDS
      );
    } catch (error) {
      this.logCustom('WARN', 'Redis profile cache write failed', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Concurrency limiter — keeps Directory API calls under 10 QPS
  // ---------------------------------------------------------------------------

  private async acquireSlot(): Promise<void> {
    if (this.activeRequests < this.MAX_CONCURRENT) {
      this.activeRequests++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.requestQueue.push(() => {
        this.activeRequests++;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this.activeRequests--;
    const next = this.requestQueue.shift();
    if (next) next();
  }

  // ---------------------------------------------------------------------------
  // Org Tree
  // ---------------------------------------------------------------------------

  /**
   * Fetches the manager email for a given user via the Admin Directory API.
   * Returns null if no manager is found (top of the org).
   */
  async getManagerEmail(userEmail: string): Promise<string | null> {
    await this.acquireSlot();
    try {
      const jwtClient = getServiceAccountClient({
        scopes: [DIRECTORY_USER_READONLY_SCOPE],
      });
      const directoryClient = admin({
        version: 'directory_v1',
        auth: jwtClient,
      });

      const response = await directoryClient.users.get({
        userKey: userEmail,
        projection: 'full',
      });

      const relations = response.data.relations as
        | Array<{ value?: string; type?: string }>
        | undefined;

      const managerRelation = relations?.find((r) => r.type === 'manager');
      return managerRelation?.value || null;
    } catch (error) {
      this.logCustom('WARN', 'Failed to fetch manager for user', {
        userEmail,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    } finally {
      this.releaseSlot();
    }
  }

  /**
   * Builds a full org tree from the top-most person down to the target email.
   * - Walks up the manager chain from targetEmail to the root.
   * - Only the target email's direct manager shows all direct reports (siblings).
   * - Higher ancestors show only the single chain node (no sibling expansion).
   * - The target email node gets its full downward subtree built.
   */
  async buildFullOrgTreeUpward(targetEmail: string): Promise<OrgTreeNode> {
    // 1. Walk up the manager chain to build the ancestry path
    const chain: string[] = [targetEmail.toLowerCase()];
    const visited = new Set<string>([targetEmail.toLowerCase()]);
    let current = targetEmail;

    while (true) {
      const manager = await this.getManagerEmail(current);
      if (!manager || visited.has(manager.toLowerCase())) break;
      chain.unshift(manager.toLowerCase());
      visited.add(manager.toLowerCase());
      current = manager;
    }

    this.logCustom('INFO', 'Manager chain resolved', {
      targetEmail,
      chainLength: chain.length,
      topEmail: chain[0],
    });

    const jwtClient = getServiceAccountClient({
      scopes: [DIRECTORY_USER_READONLY_SCOPE],
    });
    const directoryClient = admin({
      version: 'directory_v1',
      auth: jwtClient,
    });

    // 2. Build the tree top-down following the chain
    const rootProfile = await this.fetchExtendedProfile(chain[0]);
    const rootNode = this.profileToOrgNode(chain[0], rootProfile);
    let currentNode = rootNode;

    for (let i = 1; i < chain.length; i++) {
      const childEmail = chain[i];
      const isTarget = i === chain.length - 1;

      if (isTarget) {
        // Target is the last node. Fetch ALL reports of its parent (currentNode)
        // so siblings are visible, then build the target's full subtree.
        const siblingVisited = new Set<string>([currentNode.email.toLowerCase()]);
        const siblings = await this.fetchDirectReports(
          directoryClient,
          currentNode.email,
          siblingVisited
        );
        currentNode.directReports = siblings;

        // Find the target among the siblings
        let targetNode = siblings.find((r) => r.email.toLowerCase() === childEmail);

        if (!targetNode) {
          // Target not found in reports — add it manually
          const profile = await this.fetchExtendedProfile(childEmail);
          targetNode = this.profileToOrgNode(childEmail, profile);
          currentNode.directReports.push(targetNode);
        }

        // Build full subtree for the target using BFS
        const subtreeVisited = new Set<string>([childEmail.toLowerCase()]);
        const subtreeQueue: OrgTreeNode[] = [targetNode];

        while (subtreeQueue.length > 0) {
          const level = [...subtreeQueue];
          subtreeQueue.length = 0;

          const reportPromises = level.map(async (node) => {
            const reports = await this.fetchDirectReports(
              directoryClient,
              node.email,
              subtreeVisited
            );
            node.directReports = reports;
            subtreeQueue.push(...reports);
          });

          await Promise.all(reportPromises);
        }
      } else {
        // Intermediate ancestor — only show the chain node, no siblings
        const profile = await this.fetchExtendedProfile(childEmail);
        const childNode = this.profileToOrgNode(childEmail, profile);
        currentNode.directReports = [childNode];
        currentNode = childNode;
      }
    }

    // If chain has only 1 element, the target IS the root — build full subtree
    if (chain.length === 1) {
      const subtreeVisited = new Set<string>([rootNode.email.toLowerCase()]);
      const subtreeQueue: OrgTreeNode[] = [rootNode];

      while (subtreeQueue.length > 0) {
        const level = [...subtreeQueue];
        subtreeQueue.length = 0;

        const reportPromises = level.map(async (node) => {
          const reports = await this.fetchDirectReports(
            directoryClient,
            node.email,
            subtreeVisited
          );
          node.directReports = reports;
          subtreeQueue.push(...reports);
        });

        await Promise.all(reportPromises);
      }
    }

    this.logCustom('INFO', 'Full upward org tree built', {
      targetEmail,
      rootEmail: chain[0],
      totalNodes: this.countNodes(rootNode),
    });

    return rootNode;
  }

  /**
   * Builds an org tree starting from a root email using BFS.
   * Fetches direct reports at each level via the Directory API,
   * throttled to stay under the 10 QPS service account limit.
   */
  async buildOrgTree(rootEmail: string): Promise<OrgTreeNode> {
    const jwtClient = getServiceAccountClient({
      scopes: [DIRECTORY_USER_READONLY_SCOPE],
    });
    const directoryClient = admin({
      version: 'directory_v1',
      auth: jwtClient,
    });

    // Fetch root user profile
    const rootProfile = await this.fetchExtendedProfile(rootEmail);
    const rootNode = this.profileToOrgNode(rootEmail, rootProfile);

    // Visited set prevents infinite loops from circular manager references
    const visited = new Set<string>([rootEmail.toLowerCase()]);

    // BFS: process one level at a time, fetching children in parallel (throttled)
    const queue: OrgTreeNode[] = [rootNode];

    while (queue.length > 0) {
      const currentLevel = [...queue];
      queue.length = 0;

      const reportPromises = currentLevel.map(async (node) => {
        const reports = await this.fetchDirectReports(directoryClient, node.email, visited);
        node.directReports = reports;
        queue.push(...reports);
      });

      await Promise.all(reportPromises);
    }

    this.logCustom('INFO', 'Org tree built', {
      rootEmail,
      totalNodes: this.countNodes(rootNode),
    });

    return rootNode;
  }

  /**
   * Fetches all direct reports for a given manager email.
   * Uses the concurrency semaphore to respect rate limits.
   * Paginates if more than 500 results.
   */
  private async fetchDirectReports(
    directoryClient: admin_directory_v1.Admin,
    managerEmail: string,
    visited: Set<string>
  ): Promise<OrgTreeNode[]> {
    await this.acquireSlot();
    try {
      const reports: OrgTreeNode[] = [];
      let pageToken: string | undefined;

      do {
        const response = await directoryClient.users.list({
          customer: 'my_customer',
          query: `directManager='${managerEmail}'`,
          projection: 'full',
          viewType: 'admin_view',
          maxResults: 500,
          pageToken,
        });

        const users = response.data.users ?? [];
        for (const user of users) {
          const email = user.primaryEmail ?? '';
          if (!email || visited.has(email.toLowerCase())) continue;

          visited.add(email.toLowerCase());

          const profile = this.mapToGoogleProfileData(user);
          await this.setProfileCache(email, profile);
          reports.push(this.profileToOrgNode(email, profile));
        }

        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);

      return reports;
    } finally {
      this.releaseSlot();
    }
  }

  private profileToOrgNode(email: string, profile: GoogleProfileData | null): OrgTreeNode {
    return {
      email,
      name: profile?.name,
      title: profile?.organizations?.[0]?.title,
      department: profile?.organizations?.[0]?.department,
      photoUrl: profile?.photos?.[0]?.url,
      userInfo: profile?.userInfo,
      directReports: [],
    };
  }

  countNodes(node: OrgTreeNode): number {
    return 1 + node.directReports.reduce((sum, child) => sum + this.countNodes(child), 0);
  }
}

// Export singleton instance
export const googleProfileService = new GoogleProfileService();

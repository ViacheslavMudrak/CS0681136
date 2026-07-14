/**
 * Server-side only exports
 * DO NOT import this file in client-side code
 * Use only in API routes, getServerSideProps, getStaticProps, etc.
 */

export { firestoreRepository } from './repositories/firestore-repository';
export { userPreferencesService } from './services/user-preferences-service';
export { userLikesService } from './services/user-likes-service';
export { userFavoritesService } from './services/user-favorites-service';
export { userProfileService } from './services/user-profile-service';
export { userDfdTilesService } from './services/user-dfd-tiles-service';
export { mockDataService } from './services/mock-data-service';

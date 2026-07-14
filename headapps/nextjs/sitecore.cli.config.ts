import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import {
  generateSites,
  generateMetadata,
  extractFiles,
  writeImportMap,
} from '@sitecore-content-sdk/nextjs/tools';
import scConfig from './sitecore.config';

export default defineCliConfig({
  config: scConfig,
  build: {
    commands: [
      generateMetadata(),
      generateSites(),
      extractFiles(),
      writeImportMap({
        paths: ['src/components/content-sdk'],
      }),
    ],
  },
  componentMap: {
    paths: ['src/components'],
    // Exclude content-sdk auxillary components
    exclude: [
      'src/components/content-sdk/*',
      '**/*.stories.*',
      '**/*.types.*',
      '**/*.graphql.*',
      'src/components/search/components/**',
      'src/components/search/result-cards/**',
      'src/components/search/widgets/**',
    ],
  },
});

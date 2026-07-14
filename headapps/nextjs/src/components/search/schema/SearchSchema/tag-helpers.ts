import { Item } from '@sitecore-content-sdk/nextjs';

// Helper function to extract tag name from an Item
export function getTagName(tag: Item): string {
  if (tag.fields?.title && typeof tag.fields.title === 'object' && 'value' in tag.fields.title) {
    return String(tag.fields.title.value);
  }
  if (tag.name) {
    return tag.name;
  }
  return '';
}

// Helper function to transform category name to field name
function transformCategoryToFieldName(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '_') + '_tags';
}

/**
 * Helper function to get tag category from an Item
 * Dynamically transforms category name to field name
 */
export function getTagCategoryField(tag: Item): string | null {
  let category: string | null = null;

  if (
    tag.fields?.facetCategory &&
    typeof tag.fields.facetCategory === 'object' &&
    'value' in tag.fields.facetCategory &&
    tag.fields.facetCategory.value
  ) {
    category = String(tag.fields.facetCategory.value);
  }

  if (category) {
    return transformCategoryToFieldName(category);
  }

  return null;
}

/**
 * Helper function to process tags: extract names and organize by category fields
 */
export function processTags(tagItems: Item[]): {
  allTags: string[];
  byCategoryField: Record<string, string[]>;
} {
  const allTags: string[] = [];
  const byCategoryField: Record<string, string[]> = {};

  tagItems.forEach((tag) => {
    const tagName = getTagName(tag);
    if (!tagName) return;

    allTags.push(tagName);
    const categoryField = getTagCategoryField(tag);

    if (categoryField) {
      if (!byCategoryField[categoryField]) {
        byCategoryField[categoryField] = [];
      }
      byCategoryField[categoryField].push(tagName);
    }
  });

  return { allTags, byCategoryField };
}

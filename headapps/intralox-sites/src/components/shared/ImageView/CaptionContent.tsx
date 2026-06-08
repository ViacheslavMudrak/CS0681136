interface CaptionContentProps {
  content: string;
  linkedItems?: unknown[];
  links?: unknown[];
  spacing?: "xs" | "sm" | "md" | "lg";
  theme?: unknown;
}

/**
 * Renders rich text content for image captions. For Sitecore, content may be HTML.
 * linkedItems and links are preserved for future extensibility.
 */
const CaptionContent = ({
  content,
  spacing = "xs",
}: CaptionContentProps) => {
  if (!content) return null;

  return (
    <div
      className={
        {
          xs: "space-y-1",
          sm: "space-y-2",
          md: "space-y-4",
          lg: "space-y-6",
        }[spacing]
      }
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default CaptionContent;

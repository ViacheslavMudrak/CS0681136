import {
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
} from "@sitecore-content-sdk/nextjs";
import React from "react";
import { IParams } from "src/helpers/interface";
import { IFeaturedContentFields } from "../FeaturedContent.type";
import FullHeightBackground from "./components/FullHeightBackground";
import styles from "./FeaturedContentNoCard.variant.module.css";

interface IFeaturedContentVariantProps {
  testId: string;
  fields: IFeaturedContentFields;
  params: IParams;
}

const FeaturedContentNoCardVariantBase = ({ testId, fields }: IFeaturedContentVariantProps) => {
  if (!fields) {
    return <div data-testid={testId} className={styles.promotionalPanel} />;
  }

  const hasBackground = Boolean(fields.BackgroundImage?.value?.src);
  const imageUrl = fields.BackgroundImage?.value?.src || "";

  return (
    <section data-testid={testId} className={styles.promotionalPanel} aria-label="Featured content">
      {hasBackground && (
        <FullHeightBackground imageUrl={imageUrl}>
          <div className={styles.contentWrapper}>
            <div
              className={styles.logo}
              role="img"
              aria-label={String(fields.Logo?.value?.alt || "Logo")}
            >
              {fields.Logo?.value?.src ? (
                <ContentSdkImage
                  field={fields.Logo}
                  className={styles.logoImage}
                  priority
                  alt={String(fields.Logo?.value?.alt || "")}
                />
              ) : null}
            </div>
            <div className={styles.content}>
              <div className={styles.contentWrapper}>
                <div className={styles.textSection}>
                  <div className={styles.headingWrapper}>
                    <div className={styles.heading}>
                      <ContentSdkText
                        field={fields.PrimaryTitle}
                        tag="div"
                        className={styles.headingLine}
                        id="featured-content-heading"
                      />

                      <ContentSdkText
                        field={fields.SecondaryTitle}
                        tag="div"
                        className={styles.headingLine}
                        id="featured-content-heading"
                      />
                    </div>
                  </div>

                  <div
                    className={styles.descriptionWrapper}
                    {...(fields.Description?.value && {
                      id: "featured-content-description",
                    })}
                  >
                    <ContentSdkRichText field={fields.Description} className={styles.description} />
                  </div>
                </div>
                {fields.Content?.value ? (
                  <ContentSdkRichText field={fields.Content} className={styles.statusContainer} />
                ) : null}
              </div>
            </div>
          </div>
        </FullHeightBackground>
      )}
    </section>
  );
};

export const FeaturedContentNoCardVariant = React.memo(FeaturedContentNoCardVariantBase);

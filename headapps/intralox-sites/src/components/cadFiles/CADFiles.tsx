import { Container } from "components/shared/BaseContainer";
import { Section } from "components/shared/section/Section";
import { CADFilesClient } from "./partial/CADFilesCLient";

const DefaultBase = () => {
  return (
    <Section className="cad-files mt-4" removeTopPadding>
      <Container>
        <div className="flex flex-wrap gap-4">
          <CADFilesClient />
        </div>
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;

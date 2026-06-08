import type { ReactElement } from "react";
import { PortalShellProps } from "./PortalShell.type";
import PortalShellClient from "./partial/PortalShellClient";

/** Serialize so no functions are passed to the client variant */
function toSerializableProps(props: PortalShellProps) {
  return {
    rendering: JSON.parse(JSON.stringify(props.rendering)),
    page: JSON.parse(JSON.stringify(props.page)),
    params: props.params,
    fields: props.fields,
  };
}

const PortalShell = (props: PortalShellProps): ReactElement => {
  const clientProps = toSerializableProps(props);
  return <PortalShellClient {...clientProps} />;
};

export default PortalShell;

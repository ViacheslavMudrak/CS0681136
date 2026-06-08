"use client";

import { IFileFields } from "../Belt.type";
import {
  Accordion,
  AccordionItem,
} from "@laitram-l-l-c/intralox-ui-components";
import LinkView from "components/callToAction/partial/LinkVIew";
import { useTranslations } from "next-intl";
import { I18N } from "lib/dictionary-keys";

interface IDownloadProps {
  files: IFileFields[];
}

const Download = ({ files }: IDownloadProps) => {
  const t = useTranslations();
  const fileSize = (fileSize: string) => {
    return fileSize ? Number((fileSize as any) * 1024) + " KB" : "";
  };
  return (
    <Accordion>
      <AccordionItem
        id="downloads"
        title={t(I18N.DOWNLOADS)}
        className="[&_svg]:ml-4 [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <div className="prose dita-table [&_table]:text-base! [&_thead_tr_td]:font-medium [&_thead_tr_th]:font-medium [&_thead_tr_th_strong]:font-medium! [&_td]:px-2.5! [&_th]:px-2.5! [&_td]:py-1! [&_th]:py-1! [&_.align-center]:text-center [&_.valign-center]:align-middle [&_.valign-bottom]:align-bottom [&_.valign-top]:align-top overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
          <table className="mb-4">
            <thead>
              <tr>
                <th>{t(I18N.DOCUMENT_NAME)}</th>
                <th>{t(I18N.DOCUMENT_TYPE)}</th>
                <th>{t(I18N.FILE_TYPE)}</th>
                <th>{t(I18N.FILE_SIZE)}</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <LinkView
                      link={file.fields.File}
                      className="underline hover:no-underline"
                    >
                      {file.fields?.File?.value?.text}
                    </LinkView>
                  </td>
                  <td>{file.fields?.FileType?.fields?.Value?.value}</td>
                  <td className="uppercase">
                    {file.fields?.File?.value?.filetype as string}
                  </td>
                  <td>
                    {fileSize(file.fields?.File?.value?.filesize as string)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default Download;

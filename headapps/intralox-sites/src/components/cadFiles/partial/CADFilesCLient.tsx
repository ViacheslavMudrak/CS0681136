"use client";
import { useEffect, useRef } from "react";

type JQueryLike = {
  (selector?: unknown): any;
  fn: Record<string, unknown>;
  extend: (
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ) => void;
  post: (
    url: string,
    data: Record<string, string>,
    callback: (response: string) => void,
  ) => void;
};

interface JQueryWindow extends Window {
  jQuery?: JQueryLike;
  $?: JQueryLike;
}

const JQUERY_SCRIPT_ID = "cad-files-jquery-script";
const CAD_FILE_ROOT = "/cadfiles/files/";
const CAD_FILE_TREE_SCRIPT =
  "https://cdn.intralox.com/_plugins/jqueryfiletree/connectors/jqueryfiletree.aspx";

const loadJQuery = async (): Promise<JQueryLike> => {
  const typedWindow = window as JQueryWindow;
  if (typedWindow.jQuery) {
    return typedWindow.jQuery;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      JQUERY_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load jQuery script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = JQUERY_SCRIPT_ID;
    script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load jQuery script."));
    document.head.appendChild(script);
  });

  if (!typedWindow.jQuery) {
    throw new Error("jQuery is unavailable after script load.");
  }

  return typedWindow.jQuery;
};

const registerFileTreePlugin = ($: JQueryLike): void => {
  if (typeof $.fn.fileTree === "function") {
    return;
  }

  $.extend($.fn, {
    fileTree: function (
      options: Record<string, any>,
      onFileSelect: (file: string) => void,
    ) {
      const config = options || {};
      if (config.root === undefined) config.root = "/";
      if (config.script === undefined) {
        config.script =
          "_plugins/jqueryfiletree/connectors/jqueryFileTree.aspx";
      }
      if (config.folderEvent === undefined) config.folderEvent = "click";
      if (config.expandSpeed === undefined) config.expandSpeed = 500;
      if (config.collapseSpeed === undefined) config.collapseSpeed = 500;
      if (config.expandEasing === undefined) config.expandEasing = null;
      if (config.collapseEasing === undefined) config.collapseEasing = null;
      if (config.multiFolder === undefined) config.multiFolder = true;
      if (config.loadMessage === undefined) config.loadMessage = "Loading...";

      $(this).each(function (this: unknown) {
        const showTree = (container: unknown, targetPath: string) => {
          $(container).addClass("wait");
          $(".jqueryFileTree.start").remove();
          $.post(
            config.script as string,
            { dir: targetPath },
            (markup: string) => {
              $(container).find(".start").html("");
              $(container).removeClass("wait").append(markup);
              if (config.root === targetPath) {
                $(container).find("UL:hidden").show();
              } else {
                $(container).find("UL:hidden").slideDown({
                  duration: config.expandSpeed,
                  easing: config.expandEasing,
                });
              }
              bindTree(container);
            },
          );
        };

        const bindTree = (treeRoot: unknown) => {
          $(treeRoot)
            .find("LI A")
            .bind(config.folderEvent as string, function (this: unknown) {
              const currentLink = $(this);
              const parent = currentLink.parent();

              if (parent.hasClass("directory")) {
                if (parent.hasClass("collapsed")) {
                  if (!config.multiFolder) {
                    parent.parent().find("UL").slideUp({
                      duration: config.collapseSpeed,
                      easing: config.collapseEasing,
                    });
                    parent
                      .parent()
                      .find("li.directory")
                      .removeClass("expanded")
                      .addClass("collapsed");
                  }

                  parent.find("UL").remove();
                  const relValue = String(currentLink.attr("rel") || "");
                  const match = relValue.match(/.*\//);
                  showTree(parent, encodeURI(match?.[0] || relValue));
                  parent.removeClass("collapsed").addClass("expanded");
                } else {
                  parent.find("UL").slideUp({
                    duration: config.collapseSpeed,
                    easing: config.collapseEasing,
                  });
                  parent.removeClass("expanded").addClass("collapsed");
                }
              } else {
                onFileSelect(String(currentLink.attr("rel") || ""));
              }
              return false;
            });

          if (String(config.folderEvent).toLowerCase() !== "click") {
            $(treeRoot)
              .find("LI A")
              .bind("click", () => false);
          }
        };

        $(this).html(
          `<ul class="jqueryFileTree start"><li class="wait">${String(config.loadMessage)}<li></ul>`,
        );
        showTree($(this), encodeURI(String(config.root)));
      });
    },
  });
};

const CADFilesClientBase = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isUnmounted = false;

    const setupFileTree = async () => {
      try {
        const $ = await loadJQuery();
        if (isUnmounted || !ref.current) {
          return;
        }

        registerFileTreePlugin($);

        const openFile = (file: string) => {
          window.location.href = `https://cdn.intralox.com${file}`;
        };

        ($(ref.current) as any).fileTree(
          {
            root: CAD_FILE_ROOT,
            script: CAD_FILE_TREE_SCRIPT,
            expandSpeed: 500,
            collapseSpeed: 500,
            multiFolder: false,
          },
          (file: string) => openFile(file),
        );
      } catch (error) {
        console.error("CAD file tree failed to initialize.", error);
      }
    };

    setupFileTree();

    return () => {
      isUnmounted = true;
    };
  }, []);

  return <div ref={ref} id="jqfiletree" className="w-full " />;
};

export const CADFilesClient = CADFilesClientBase;

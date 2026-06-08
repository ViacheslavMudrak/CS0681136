"use client";

import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { Checkbox } from "@laitram-l-l-c/intralox-ui-components";
import React, { useState } from "react";
import {
  type TableBorderStyle,
  type TableDensity,
  tableBodyCellClasses,
  tableCellBorderClasses,
  tableCellInlineEndBorderClasses,
  tableCheckboxClasses,
  tableClasses,
  tableDefaultRowBgClasses,
  tableEmptyStateClasses,
  tableHeaderCellClasses,
  tableHeaderLabelFlexClasses,
  tableHeaderLabelTextClasses,
  tableHeaderStickyClasses,
  tableHeaderTextClasses,
  tableLoadingContainerClasses,
  tableLoadingTextClasses,
  tablePaddingClasses,
  tablePlaceholderCellClasses,
  tablePlaceholderEmptyInnerClasses,
  tablePlaceholderLoadingInnerClasses,
  tableRowClasses,
  tableSelectBodyCellClasses,
  tableSelectHeaderCellClasses,
  tableShowsInlineEndBorder,
  tableSortIndicatorClasses,
  tableStripedRowBgClasses,
  tableWrapperClasses,
} from "./tableVariants";
import {
  Table as AriaTable,
  Cell,
  Column,
  Row,
  Selection,
  TableBody,
  TableHeader,
} from "react-aria-components";
import { TableProps, TableColumn, TableSort } from "./Table.types";

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  striped = false,
  hoverable = true,
  showBorders,
  borderStyle = "full",
  rowClassName,
  headerClassName,
  emptyMessage = "No data available",
  isLoading = false,
  loadingWithHeader = false,
  loadingReplacesRows = false,
  loadingComponent,
  emptyWithHeader = false,
  emptyComponent,
  selectable = false,
  selectedKeys,
  sortable = false,
  sort,
  className,
  headerBgColor = "bg-[#F7F9FC]",
  headerTextColor = "text-[#222222]",
  rowBgColor,
  maxHeight,
  size = "md",
  density = "normal",
  highlightOnHover = true,
  hoverColor = "hover:bg-bg-lighter-gray",
  ariaLabel = "Data table",
  expandedRowClassName,
  expandedCellClassName,
  scrollContainerRef,
  getRowKey,
  onSelectionChange,
  onSortChange,
  onRowClick,
  renderExpandedRow,
}: TableProps<T>) {
  const [internalSort, setInternalSort] = useState<TableSort | undefined>(sort);

  const resolvedBorderStyle: TableBorderStyle = showBorders === false ? "none" : borderStyle;

  const handleColumnClick = (columnId: string) => {
    if (!sortable) return;

    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    let newDirection: "asc" | "desc" = "asc";
    if (internalSort?.columnId === columnId && internalSort.direction === "asc") {
      newDirection = "desc";
    }

    const newSort = { columnId, direction: newDirection };
    setInternalSort(newSort);
    onSortChange?.(newSort);
  };

  const currentSort = sort ?? internalSort;

  const getInlineEndBorderClass = (isLastColumn: boolean): string => {
    const showInlineEnd = !isLastColumn && tableShowsInlineEndBorder(resolvedBorderStyle);
    return tableCellInlineEndBorderClasses({ showInlineEnd });
  };

  const getTextAlignStyle = (
    align?: "left" | "center" | "right"
  ): React.CSSProperties | undefined => {
    if (align === "center") return { textAlign: "center" };
    if (align === "right") return { textAlign: "end" };
    return { textAlign: "start" };
  };

  const getRowBgColor = (index: number): string => {
    if (typeof rowBgColor === "function") {
      return rowBgColor(index);
    }
    if (rowBgColor) {
      return rowBgColor;
    }
    if (striped) {
      return tableStripedRowBgClasses({
        stripe: index % 2 === 0 ? "even" : "odd",
      });
    }
    return tableDefaultRowBgClasses();
  };

  const padding = tablePaddingClasses({ density });
  const headerText = tableHeaderTextClasses({ size });
  const cellBorder = tableCellBorderClasses({ borderStyle: resolvedBorderStyle });

  const emptyData = !data || data.length === 0;
  const showLoadingPlaceholderRow = Boolean(
    isLoading && loadingWithHeader && (emptyData || loadingReplacesRows)
  );
  const showEmptyPlaceholderRow = Boolean(!isLoading && emptyWithHeader && emptyData);

  if (isLoading && !loadingWithHeader) {
    return (
      <div className={cn(tableWrapperClasses({ className }))}>
        {loadingComponent ?? (
          <div className={cn(tableLoadingContainerClasses(), padding)}>
            <span className={tableLoadingTextClasses()}>Loading...</span>
          </div>
        )}
      </div>
    );
  }

  if (emptyData && !showLoadingPlaceholderRow && !showEmptyPlaceholderRow) {
    return (
      <div className={cn(tableWrapperClasses({ className }))}>
        <div className={cn(tableEmptyStateClasses(), headerText)}>{emptyMessage}</div>
      </div>
    );
  }

  const colSpan = columns.length + (selectable ? 1 : 0);

  return (
    <div
      ref={scrollContainerRef}
      className={cn(tableWrapperClasses({ scrollY: Boolean(maxHeight), className }))}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <AriaTable
        aria-label={ariaLabel}
        aria-busy={isLoading || undefined}
        selectionMode={selectable ? "multiple" : undefined}
        selectedKeys={selectedKeys as any}
        onSelectionChange={onSelectionChange as any}
        className={cn(tableClasses({ borderStyle: resolvedBorderStyle }))}
      >
        <TableHeader className={cn(tableHeaderStickyClasses(), headerClassName)}>
          {selectable && (
            <Column
              key="select"
              id="select"
              width={60}
              className={cn(
                tableSelectHeaderCellClasses(),
                padding,
                headerBgColor,
                headerTextColor,
                "border-t border-[#E9EDF4]",
                getInlineEndBorderClass(false)
              )}
            >
              <Checkbox
                slot="selection"
                className={tableCheckboxClasses()}
                aria-label="Select all rows"
              />
            </Column>
          )}
          {columns.map((column: TableColumn<any>, index: number) => (
            <Column
              key={column.id}
              id={column.id}
              width={column.width as any}
              isRowHeader={index === 0}
              allowsSorting={sortable && Boolean(column.sortable)}
              aria-sort={
                currentSort?.columnId === column.id
                  ? currentSort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined
              }
              className={cn(
                padding,
                headerBgColor,
                headerTextColor,
                headerText,
                tableHeaderCellClasses({ sortable: sortable && column.sortable }),
                cellBorder,
                "border-t border-[#E9EDF4]",
                getInlineEndBorderClass(index === columns.length - 1),
                column.headerClassName
              )}
              style={getTextAlignStyle(column.align)}
              onClick={() => handleColumnClick(column.id)}
            >
              {column.renderHeader ? (
                column.renderHeader()
              ) : (
                <div
                  className={tableHeaderLabelFlexClasses({
                    align: column.align ?? "left",
                  })}
                >
                  <span
                    className={tableHeaderLabelTextClasses({
                      wrap: Boolean(column.wrapHeader),
                    })}
                  >
                    {column.label}
                  </span>
                  {sortable && column.sortable && currentSort?.columnId === column.id && (
                    <span className={tableSortIndicatorClasses()}>
                      {currentSort.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              )}
            </Column>
          ))}
        </TableHeader>
        <TableBody>
          {showLoadingPlaceholderRow ? (
            <Row id="table-loading-placeholder">
              <Cell
                colSpan={colSpan}
                className={cn(padding, tablePlaceholderCellClasses(), cellBorder)}
              >
                <div
                  role="status"
                  aria-live="polite"
                  className={tablePlaceholderLoadingInnerClasses()}
                >
                  {loadingComponent ?? (
                    <LoadingSkeleton
                      variant="skeleton"
                      size="large"
                      className="!p-0 w-full max-w-2xl"
                    />
                  )}
                </div>
              </Cell>
            </Row>
          ) : null}
          {showEmptyPlaceholderRow ? (
            <Row id="table-empty-placeholder">
              <Cell
                colSpan={colSpan}
                className={cn(padding, tablePlaceholderCellClasses(), cellBorder)}
              >
                <div role="status" className={tablePlaceholderEmptyInnerClasses()}>
                  {emptyComponent ?? emptyMessage}
                </div>
              </Cell>
            </Row>
          ) : null}
          {!showLoadingPlaceholderRow && !showEmptyPlaceholderRow
            ? data.map((item: any, rowIndex: number) => {
                const rowKey = getRowKey(item, rowIndex);
                const rowBg = getRowBgColor(rowIndex);
                const customRowClass =
                  typeof rowClassName === "function" ? rowClassName(item, rowIndex) : rowClassName;

                const expandedContent = renderExpandedRow?.(item, rowIndex);

                return (
                  <React.Fragment key={String(rowKey)}>
                    <Row
                      id={String(rowKey)}
                      className={cn(
                        rowBg,
                        tableRowClasses({ clickable: Boolean(onRowClick) }),
                        hoverable && highlightOnHover && hoverColor,
                        customRowClass
                      )}
                      onPress={() => onRowClick?.(item, rowIndex)}
                    >
                      {selectable && (
                        <Cell
                          className={cn(
                            padding,
                            tableSelectBodyCellClasses(),
                            cellBorder,
                            getInlineEndBorderClass(false)
                          )}
                          style={getTextAlignStyle("center")}
                        >
                          <Checkbox
                            slot="selection"
                            className={tableCheckboxClasses()}
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </Cell>
                      )}
                      {columns.map((column: TableColumn<any>, colIndex: number) => {
                        const isLastColumn = colIndex === columns.length - 1;
                        const cellValue = column.render
                          ? column.render(item, rowIndex)
                          : column.key
                            ? item[column.key]
                            : null;

                        return (
                          <Cell
                            key={`${rowKey}-${column.id}`}
                            className={cn(
                              padding,
                              tableBodyCellClasses(),
                              cellBorder,
                              getInlineEndBorderClass(isLastColumn),
                              column.cellClassName
                            )}
                            style={getTextAlignStyle(column.align)}
                          >
                            {cellValue}
                          </Cell>
                        );
                      })}
                    </Row>
                    {expandedContent ? (
                      <Row id={`${String(rowKey)}-expanded`} className={cn(expandedRowClassName)}>
                        <Cell colSpan={colSpan} className={cn(cellBorder, expandedCellClassName)}>
                          {expandedContent}
                        </Cell>
                      </Row>
                    ) : null}
                  </React.Fragment>
                );
              })
            : null}
        </TableBody>
      </AriaTable>
    </div>
  );
}

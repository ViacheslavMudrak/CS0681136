import { TableBorderStyle, TableDensity } from "./tableVariants";

export interface TableColumn<T> {
  id: string;
  label?: string | React.ReactNode;
  key?: keyof T;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  wrapHeader?: boolean;
  renderHeader?: () => React.ReactNode;
  render?: (item: T, rowIndex: number) => React.ReactNode;
}

export interface TableSort {
  columnId: string;
  direction: "asc" | "desc";
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];

  striped?: boolean;
  hoverable?: boolean;
  showBorders?: boolean;
  borderStyle?: TableBorderStyle;
  rowClassName?: string | ((item: T, index: number) => string);
  headerClassName?: string;
  cellClassName?: string;
  emptyMessage?: React.ReactNode;
  isLoading?: boolean;
  loadingWithHeader?: boolean;
  loadingReplacesRows?: boolean;
  loadingComponent?: React.ReactNode;
  emptyWithHeader?: boolean;
  emptyComponent?: React.ReactNode;
  selectable?: boolean;
  selectedKeys?: Selection;
  sortable?: boolean;
  sort?: TableSort;
  className?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  rowBgColor?: string | ((index: number) => string);
  maxHeight?: string;
  size?: "sm" | "md" | "lg";
  density?: TableDensity;
  highlightOnHover?: boolean;
  hoverColor?: string;
  ariaLabel?: string;
  expandedRowClassName?: string;
  expandedCellClassName?: string;
  scrollContainerRef?: React.Ref<HTMLDivElement>;
  getRowKey: (item: T, index: number) => string | number;
  onSelectionChange?: (keys: Selection) => void;
  onSortChange?: (sort: TableSort) => void;
  onRowClick?: (item: T, index: number) => void;
  renderExpandedRow?: (item: T, rowIndex: number) => React.ReactNode | null;
}

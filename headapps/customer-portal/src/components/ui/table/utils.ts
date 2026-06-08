import { TableColumn } from "./Table.types";

export function createTableColumn<T extends Record<string, any>>(
  config: TableColumn<T>
): TableColumn<T> {
  return config;
}

export function createActionColumn<T extends Record<string, any>>(
  render: (item: T, rowIndex: number) => React.ReactNode,
  options?: {
    label?: string;
    width?: string;
    align?: "left" | "center" | "right";
  }
): TableColumn<T> {
  return {
    id: "actions",
    label: options?.label || "Actions",
    width: options?.width || "auto",
    align: options?.align || "center",
    render,
  };
}

export function sortTableData<T extends Record<string, any>>(
  data: T[],
  columnId: string,
  direction: "asc" | "desc",
  options?: { customComparator?: (a: any, b: any) => number }
): T[] {
  const sorted = [...data];

  sorted.sort((a, b) => {
    const valueA = a[columnId];
    const valueB = b[columnId];

    if (options?.customComparator) {
      const comparison = options.customComparator(valueA, valueB);
      return direction === "asc" ? comparison : -comparison;
    }

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return direction === "asc" ? 1 : -1;
    if (valueB == null) return direction === "asc" ? -1 : 1;

    if (typeof valueA === "string" && typeof valueB === "string") {
      return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return direction === "asc" ? valueA - valueB : valueB - valueA;
    }

    return direction === "asc"
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  });

  return sorted;
}

export function filterTableData<T extends Record<string, any>>(
  data: T[],
  criteria: Record<string, any>
): T[] {
  return data.filter((item) => {
    return Object.entries(criteria).every(([key, value]) => {
      if (value === null || value === undefined || value === "") return true;

      const itemValue = item[key];
      if (itemValue == null) return false;

      const itemStr = String(itemValue).toLowerCase();
      const filterStr = String(value).toLowerCase();

      return itemStr.includes(filterStr);
    });
  });
}

export function paginateTableData<T>(
  data: T[],
  page: number,
  pageSize: number
): { data: T[]; totalPages: number; hasMore: boolean } {
  const offset = (page - 1) * pageSize;
  const totalPages = Math.ceil(data.length / pageSize);

  return {
    data: data.slice(offset, offset + pageSize),
    totalPages,
    hasMore: page < totalPages,
  };
}

export function extractColumnValues<T extends Record<string, any>, K extends keyof T>(
  data: T[],
  key: K
): T[K][] {
  return data.map((item) => item[key]);
}

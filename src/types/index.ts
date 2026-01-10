export interface LinkItem {
  id: string;
  title: string;      // Max 1 line (truncate)
  url: string;        // Max 2 lines (line-clamp-2)
  order: number;      // For dnd-kit sorting logic
  createdAt: number;
}

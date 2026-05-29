import { DishTypeValue } from "@/const/admin/dish";

export type DishFormValues = {
    name: string;
    type: string;
};

export type DishItem = {
  id: number | null
  documentId: string | null
  name: string
  type: DishTypeValue | string
  createdAt: string
}

export type FetchDishesParams = {
  page?: number
  pageSize?: number
  type?: string
}

export type FetchDishesResult = {
  data: DishItem[]
  pagination: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}
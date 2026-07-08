"use client"

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'
import { Edit, Trash2 } from 'lucide-react'
import { IoIosRefresh } from "react-icons/io"
import { fetchDishes } from '@/features/admin/get-dish'
import { deleteDish } from '@/features/admin/delete-dish'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dishTypeOptions, getDishTypeLabel, serviceOptions, getServiceLabel } from '@/const/admin/dish'
import { DishItem } from '@/types/admin/dish'
import { getCurrentUser } from '@/features/admin/create-order'
import { getPermissions } from '@/const/permissions'

export default function page() {
  const [dishes, setDishes] = React.useState<DishItem[]>([])
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 25
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [totalItems, setTotalItems] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [canManage, setCanManage] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const user = await getCurrentUser()
      if (!isMounted) return
      setCanManage(
        getPermissions(user?.staff?.position ?? null, user?.staff?.department ?? null)
          .canManageMenu
      )
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter])

  const safeCurrentPage = Math.min(currentPage, totalPages || 1)
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + dishes.length, totalItems)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const loadDishes = React.useCallback(async (page: number, type: string, isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const result = await fetchDishes({ page, pageSize, type })
      setDishes(result.data)
      setTotalItems(result.pagination.total)
      setTotalPages(Math.max(1, result.pagination.pageCount))
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memuat data menu"
      toast.error(message)
      return false
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [pageSize])

  React.useEffect(() => {
    loadDishes(currentPage, typeFilter)
  }, [currentPage, typeFilter, loadDishes])

  const handleDeleteDish = async (dish: DishItem) => {
    const identifier = dish.documentId ?? (dish.id !== null ? String(dish.id) : "")

    if (!identifier) {
      toast.error("Document ID menu tidak valid")
      return
    }

    setIsDeletingId(identifier)
    try {
      const result = await deleteDish(identifier)
      if (!result.success) {
        throw new Error(result.error || "Gagal menghapus menu")
      }
      await loadDishes(currentPage, typeFilter)
      toast.success("menu berhasil dihapus")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus menu"
      toast.error(message)
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleRefreshDishes = async () => {
    const success = await loadDishes(currentPage, typeFilter, true)
    if (success) {
      toast.success("Data menu berhasil diperbarui")
    }
  }
  return (
    <div className='bg-white w-full mx-auto'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 flex flex-col gap-4 py-4 px-4 max-w-7xl border-black w-full md:flex-row md:items-center md:justify-between'>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h1 className='font-bold text-xl'>Manajemen Menu</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Jenis</span>
                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter Jenis</SelectLabel>
                        <SelectItem value="all">Semua</SelectItem>
                        {dishTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className='ml-0 flex gap-2'>
                {canManage && (
                  <Link href={"/admin/dish/add"}>
                      <Button className='cursor-pointer'><FaPlus />Tambah menu</Button>
                  </Link>
                )}
            </div>
        </div>
        <div className="p-4">
        <div className="rounded-lg border border-gray-200 overflow-hidden mt-6 mb-8">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-left'>No</TableHead>
                <TableHead className='text-left'>Nama menu</TableHead>
                <TableHead className='text-left'>Jenis</TableHead>
                <TableHead className='text-left'>Layanan</TableHead>
                {canManage && <TableHead className='text-center'>Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    Memuat data menu...
                  </TableCell>
                </TableRow>
              ) : dishes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    Belum ada data menu
                  </TableCell>
                </TableRow>
              ) : (
                dishes.map((dish, index) => {
                  const identifier = dish.documentId ?? (dish.id !== null ? String(dish.id) : "")
                  const displayIndex = startIndex + index + 1

                  return (
                    <TableRow key={dish.documentId ?? dish.id ?? index}>
                      <TableCell className='text-left'>{displayIndex}</TableCell>
                      <TableCell className="text-left">{dish.name}</TableCell>
                      <TableCell className='text-left'>{getDishTypeLabel(dish.type)}</TableCell>
                      <TableCell className='text-left'>{getServiceLabel(dish.service)}</TableCell>
                     {canManage && (
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            {identifier && (
                              <Link href={`/admin/dish/${identifier}/edit`}>
                                <Button
                                  className='bg-white border border-red-700 text-red-700 hover:bg-red-700 hover:text-white cursor-pointer'
                                  size="icon"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className='cursor-pointer'
                                  size="icon"
                                  disabled={!identifier || isDeletingId === identifier}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus menu?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  menu {dish.name} akan dihapus. Tindakan ini tidak bisa dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDish(dish)}>
                                  Ya, hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          </div>

          <div className='flex flex-col gap-4 mb-12 md:flex-row md:items-center md:justify-between'>
            <div className='flex justify-start'>
              <h1>
                Menampilkan: {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} menu
              </h1>
            </div>
            <div className='flex justify-end'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(event) => {
                      event.preventDefault()
                      handlePageChange(safeCurrentPage - 1)
                    }} />
                  </PaginationItem>
                  {pageNumbers.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === safeCurrentPage}
                        onClick={(event) => {
                          event.preventDefault()
                          handlePageChange(page)
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(event) => {
                      event.preventDefault()
                      handlePageChange(safeCurrentPage + 1)
                    }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
        </div>
        </div>
    </div>
  )
}

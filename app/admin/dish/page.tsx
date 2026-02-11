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
import { IoIosRefresh } from "react-icons/io"
import { fetchDishes, type DishItem } from '@/features/get-dish'
import { deleteDish } from '@/features/delete-dish'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { dishTypeOptions, getDishTypeLabel } from '@/app/admin/dish/dish-constants'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function page() {
  const [dishes, setDishes] = React.useState<DishItem[]>([])
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 25
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    const loadDishes = async () => {
      const data = await fetchDishes()
      if (isMounted) {
        setDishes(data)
      }
    }

    loadDishes()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter])

  const filteredDishes = React.useMemo(() => {
    if (typeFilter === "all") return dishes
    return dishes.filter((dish) => dish.type === typeFilter)
  }, [dishes, typeFilter])

  const totalItems = filteredDishes.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const pagedDishes = filteredDishes.slice(startIndex, endIndex)
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

  const handleDeleteDish = async (dish: DishItem) => {
    const identifier = dish.documentId ?? (dish.id !== null ? String(dish.id) : "")

    if (!identifier) {
      toast.error("Document ID lauk tidak valid")
      return
    }

    setIsDeletingId(identifier)
    try {
      const result = await deleteDish(identifier)
      if (!result.success) {
        throw new Error(result.error || "Gagal menghapus lauk")
      }
      setDishes((prev) => prev.filter((item) => (item.documentId ?? String(item.id)) !== identifier))
      toast.success("Lauk berhasil dihapus")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus lauk"
      toast.error(message)
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleRefreshDishes = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchDishes()
      setDishes(data)
      toast.success("Data lauk berhasil diperbarui")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui data lauk"
      toast.error(message)
    } finally {
      setIsRefreshing(false)
    }
  }
  return (
    <div className='bg-white w-full mx-auto'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 flex flex-col gap-4 py-4 px-4 max-w-7xl border-black w-full md:flex-row md:items-center md:justify-between'>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h1 className='font-bold text-xl'>Manajemen Lauk</h1>
                <Button
                  className="cursor-pointer flex items-center p-2 bg-background rounded-lg shadow-sm"
                  onClick={handleRefreshDishes}
                  disabled={isRefreshing}
                >
                  <IoIosRefresh className={`text-black hover:text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
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
                <Link href={"/admin/dish/add"}>
                    <Button className='cursor-pointer bg-gray-400'><FaPlus />Tambah Lauk</Button>
                </Link>
            </div>
        </div>
        <Table className='border mt-6 mb-8'>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>No</TableHead>
                <TableHead className='text-center'>Nama Lauk</TableHead>
                <TableHead className='text-center'>Jenis</TableHead>
                <TableHead className='text-center'>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedDishes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    Belum ada data lauk
                  </TableCell>
                </TableRow>
              ) : (
                pagedDishes.map((dish, index) => {
                  const identifier = dish.documentId ?? (dish.id !== null ? String(dish.id) : "")
                  const displayIndex = startIndex + index + 1

                  return (
                    <TableRow key={dish.documentId ?? dish.id ?? index}>
                      <TableCell className='text-center'>{displayIndex}</TableCell>
                      <TableCell className="text-center">{dish.name}</TableCell>
                      <TableCell className='text-center'>{getDishTypeLabel(dish.type)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            asChild
                            className='bg-white border border-gray-500 hover:bg-gray-600 text-gray-500 cursor-pointer hover:text-white'
                            disabled={!identifier}
                          >
                            <Link href={identifier ? `/admin/dish/${identifier}/edit` : "#"}>
                              <Label>Edit</Label>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className='bg-gray-500 hover:bg-gray-600 cursor-pointer hover:text-white'
                                disabled={!identifier || isDeletingId === identifier}
                              >
                                {isDeletingId === identifier ? "Menghapus..." : "Hapus"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus lauk?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Lauk {dish.name} akan dihapus. Tindakan ini tidak bisa dibatalkan.
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
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          <div className='flex flex-col gap-4 mb-12 px-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex justify-start'>
              <h1>
                Menampilkan: {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} Lauk
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
  )
}

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
import Image from 'next/image'
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'
import { fetchMenus, type MenuPackage } from '@/features/admin/get-menu'
import { deleteMenu } from '@/features/admin/delete-menu'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { getStrapiURL } from '@/lib/utils'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from '@/features/admin/create-order'

export default function page() {
  const [menus, setMenus] = React.useState<MenuPackage[]>([])
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [productFilter, setProductFilter] = React.useState("all")
  const [canManage, setCanManage] = React.useState(false)

  const formatPrice = (value: string) => {
    if (!value || value === "-") return "-"
    return value
  }

  const resolveImageUrl = (value: string) => {
    const trimmed = value?.trim()
    if (!trimmed || trimmed === "-") {
      return "/asset/login.svg"
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed
    }
    if (trimmed.startsWith("/")) {
      return getStrapiURL(trimmed)
    }
    return trimmed
  }

  const normalizeRoleValue = (value: string | null | undefined) =>
    value?.toLowerCase() ?? ""

  const canManageMenu = (position: string | null, department: string | null) => {
    const normalizedPosition = normalizeRoleValue(position)
    const normalizedDepartment = normalizeRoleValue(department)

    const isManager =
      normalizedPosition === "manager" && normalizedDepartment === "manager"
    const isAdminOperational =
      normalizedPosition === "admin_operational" &&
      normalizedDepartment === "operational"

    return isManager || isAdminOperational
  }

  React.useEffect(() => {
    let isMounted = true

    const loadMenus = async () => {
      const data = await fetchMenus()
      if (isMounted) {
        setMenus(data)
      }
    }

    loadMenus()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const user = await getCurrentUser()
      if (!isMounted) return

      const allowed = canManageMenu(
        user?.staff?.position ?? null,
        user?.staff?.department ?? null
      )
      setCanManage(allowed)
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, productFilter])

  const productOptions = React.useMemo(() => {
    const map = new Map<string, string>()
    menus.forEach((menu) => {
      const raw = menu.product?.trim()
      if (!raw || raw === "-") return
      const key = raw.toLowerCase()
      if (!map.has(key)) {
        map.set(key, raw)
      }
    })
    return Array.from(map.values())
  }, [menus])

  const filteredMenus = React.useMemo(() => {
    if (productFilter === "all") return menus
    return menus.filter((menu) => menu.product === productFilter)
  }, [menus, productFilter])

  const totalItems = filteredMenus.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const pagedMenus = filteredMenus.slice(startIndex, endIndex)

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const tableColumnCount = canManage ? 7 : 6

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleDeleteMenu = async (menu: MenuPackage) => {
    const identifier = menu.documentId ?? (menu.id !== null ? String(menu.id) : "")

    if (!identifier) {
      toast.error("Document ID paket tidak valid")
      return
    }

    setIsDeletingId(identifier)
    try {
      const result = await deleteMenu(identifier)
      if (!result.success) {
        throw new Error(result.error || "Gagal menghapus paket")
      }
      setMenus((prev) => prev.filter((item) => (item.documentId ?? String(item.id)) !== identifier))
      toast.success("Paket berhasil dihapus")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus paket"
      toast.error(message)
    } finally {
      setIsDeletingId(null)
    }
  }

  return (
    <div className='bg-white w-full mx-auto'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 flex flex-col gap-4 py-4 px-4 max-w-7xl border-black w-full md:flex-row md:items-center md:justify-between'>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className='font-bold text-xl'>Manajemen Menu</h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tampil</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Jumlah Data</SelectLabel>
                        {[10, 25, 50, 100].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Produk</span>
                  <Select value={productFilter} onValueChange={(value) => setProductFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter Produk</SelectLabel>
                        <SelectItem value="all">Semua</SelectItem>
                        {productOptions.map((product) => (
                          <SelectItem key={product} value={product}>
                            {product}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {canManage && (
              <div className='ml-0 flex gap-2'>
                  <Link href={"/admin/menu/add"}>
                      <Button className='cursor-pointer'><FaPlus />Tambah Menu</Button>
                  </Link>
              </div>
            )}
        </div>
        <Table className='border mt-6 mb-8'>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>No</TableHead>
                <TableHead className='text-center'>Nama Paket</TableHead>
                <TableHead className='text-center'>Jenis Menu</TableHead>
                <TableHead className='text-center'>Harga</TableHead>
                <TableHead className='text-center'>Produk</TableHead>
                <TableHead className='text-center'>Detail Menu</TableHead>
                {canManage && <TableHead className='text-center'>Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedMenus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableColumnCount} className="text-center text-sm text-gray-500">
                    Belum ada data paket
                  </TableCell>
                </TableRow>
              ) : (
                pagedMenus.map((menu, index) => {
                  const identifier = menu.documentId ?? (menu.id !== null ? String(menu.id) : "")
                  const imageSrc = resolveImageUrl(menu.image_url)
                  const displayIndex = startIndex + index + 1

                  return (
                    <TableRow key={menu.documentId ?? menu.id ?? index}>
                      <TableCell className='text-center'>{displayIndex}</TableCell>
                      <TableCell className="text-center">{menu.package_name}</TableCell>
                      <TableCell className='text-center'>{menu.subname}</TableCell>
                      <TableCell className='text-center'>{formatPrice(menu.price)}</TableCell>
                      <TableCell className='text-center'>{menu.product}</TableCell>
                      <TableCell className='flex items-center justify-center'>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className='bg-white border border-gray-500 hover:bg-gray-600 cursor-pointer hover:text-white' size="icon">
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle className='flex items-center justify-center font-bold'>Detail Paket</AlertDialogTitle>
                                  <Carousel className="w-full max-w-xs mx-auto">
                                    <CarouselContent>
                                        <CarouselItem>
                                          <div className="p-1">
                                            <Card>
                                              <CardContent className="flex aspect-square items-center justify-center p-6">
                                                <Image
                                                  src={imageSrc}
                                                  alt={menu.package_name}
                                                  width={300}
                                                  height={300}
                                                  className="object-contain"
                                                  unoptimized
                                                />
                                              </CardContent>
                                            </Card>
                                          </div>
                                        </CarouselItem>
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                  </Carousel>
                                <div className='flex flex-col space-y-4'>
                                  <Badge className='text-[#EF3936] bg-[#FDECEC] mt-6 h-8'>{menu.product}</Badge>
                                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                    <h1 className='font-bold break-words'>{menu.package_name}</h1>
                                    <h1 className='text-[#EF4444] font-bold'>{formatPrice(menu.price)}</h1>
                                  </div>
                                  <div>
                                    <h1 className='font-bold'>Jenis Menu</h1>
                                    <h1 className='text-sm break-words'>{menu.subname}</h1>
                                  </div>
                                  <div>
                                    <h1 className='font-bold'>Deskripsi</h1>
                                    <h1 className='text-sm break-words'>{menu.description}</h1>
                                  </div>
                                </div>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Tutup</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button
                              asChild
                              className='bg-white border border-gray-500 hover:bg-gray-600 text-gray-500 cursor-pointer hover:text-white'
                              disabled={!identifier}
                            >
                              <Link href={identifier ? `/admin/menu/${identifier}/edit` : "#"}>
                                <Label>Edit</Label>
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className='cursor-pointer'
                                  disabled={!identifier || isDeletingId === identifier}
                                >
                                  {isDeletingId === identifier ? "Menghapus..." : "Hapus"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus paket?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Paket {menu.package_name} akan dihapus. Tindakan ini tidak bisa dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteMenu(menu)}>
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

          <div className='flex flex-col gap-4 mb-12 px-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex justify-start'>
              <h1>
                Menampilkan: {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} Menu
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

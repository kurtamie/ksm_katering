"use client"
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LaptopMinimalCheck, UserIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from '@/components/ui/checkbox';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { fetchStaffs, type Staff } from '@/features/admin/get-staff';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function page() {  
  const [selectedUser, setSelectedUser] = useState('current');
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [accessMap, setAccessMap] = useState<Record<string, string[]>>({})
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [searchDepartment, setSearchDepartment] = useState("")
  const [searchPosition, setSearchPosition] = useState("")
  const users = [
    'Pengguna Aktif', 'Diblokir', 'Tidak Aktif',
  ];
  const accessOptions = [
    { id: "order", label: "Order", route: "/admin/order" },
    { id: "customer", label: "Customer", route: "/admin/customer" },
    { id: "menu", label: "Menu", route: "/admin/menu" },
    { id: "dish", label: "Dish", route: "/admin/dish" },
    { id: "graph", label: "Grafik", route: "/admin/graph" },
    { id: "calendar", label: "Kalender", route: "/admin/calendar" },
    { id: "user", label: "User", route: "/admin/user" },
  ]

  React.useEffect(() => {
    let isMounted = true

    const loadStaffs = async () => {
      const data = await fetchStaffs()
      if (isMounted) {
        setStaffs(data)
      }
    }

    loadStaffs()

    return () => {
      isMounted = false
    }
  }, [])

  const getStaffKey = (staff: Staff, index: number) => {
    if (staff.documentId) return staff.documentId
    if (staff.id !== null) return String(staff.id)
    return `row-${index}`
  }

  const handleStaffClick = (staff: Staff) => {
    setSelectedStaff(staff)
    setDrawerOpen(true)
  }

  const handleToggleAccess = (staffKey: string, route: string) => {
    setAccessMap((prev) => {
      const current = new Set(prev[staffKey] ?? [])
      if (current.has(route)) {
        current.delete(route)
      } else {
        current.add(route)
      }
      return { ...prev, [staffKey]: Array.from(current) }
    })
  }

  const normalizedDepartment = searchDepartment.trim().toLowerCase()
  const normalizedPosition = searchPosition.trim().toLowerCase()

  const filteredStaffs = staffs.filter((staff) => {
    const departmentMatch =
      normalizedDepartment.length === 0 ||
      staff.department?.toLowerCase().includes(normalizedDepartment)
    const positionMatch =
      normalizedPosition.length === 0 ||
      staff.position?.toLowerCase().includes(normalizedPosition)
    return departmentMatch && positionMatch
  })

  const sortedStaffs = [...filteredStaffs].sort((a, b) => {
    const nameA = a.name ?? ""
    const nameB = b.name ?? ""
    return sortOrder === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA)
  })

  const totalCount = sortedStaffs.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = totalCount === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
  const pageEnd = totalCount === 0 ? 0 : Math.min(safeCurrentPage * pageSize, totalCount)
  const pagedStaffs = sortedStaffs.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  )

  React.useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, searchDepartment, searchPosition, sortOrder])

  const getPaginationItems = (current: number, total: number) => {
    if (total <= 6) return Array.from({ length: total }, (_, index) => index + 1)
    const items: Array<number | "ellipsis"> = [1]
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    if (start > 2) items.push("ellipsis")
    for (let page = start; page <= end; page += 1) {
      items.push(page)
    }
    if (end < total - 1) items.push("ellipsis")
    items.push(total)
    return items
  }

  return (
    <div className='bg-white w-full mx-auto'>
        <div className='border-b-1 py-4 px-4 max-w-7xl border-black w-full flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <h1 className='font-bold text-xl'>Manajemen Akun Internal</h1>
            <div className='flex gap-2'>
              <Link href={"/admin/user/add"}>
                <Button className='cursor-pointer bg-gray-400'><FaPlus />Tambah Staff</Button>
              </Link>
            </div>
        </div>
        <div className="mb-6 p-4">
            <div className='gap-6 flex flex-wrap items-center'>
                <Label>Status :</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>Status User</SelectLabel>
                    <SelectItem value="current">Pengguna Aktif</SelectItem>
                    {users.map((user, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                        {user}
                        </SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[180px] justify-between">
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 p-2" align="start">
                    <DropdownMenuLabel>Pagination</DropdownMenuLabel>
                    {[10, 25, 50, 100].map((size) => (
                      <DropdownMenuCheckboxItem
                        key={size}
                        checked={pageSize === size}
                        onCheckedChange={() => setPageSize(size)}
                      >
                        {size} data
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Urutkan Nama</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={sortOrder === "asc"}
                      onCheckedChange={() => setSortOrder("asc")}
                    >
                      A-Z
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortOrder === "desc"}
                      onCheckedChange={() => setSortOrder("desc")}
                    >
                      Z-A
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Cari</DropdownMenuLabel>
                    <div className="space-y-2 px-2 pb-2">
                      <Input
                        placeholder="Cari departemen"
                        value={searchDepartment}
                        onChange={(event) => setSearchDepartment(event.target.value)}
                      />
                      <Input
                        placeholder="Cari posisi"
                        value={searchPosition}
                        onChange={(event) => setSearchPosition(event.target.value)}
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table className='border mt-6 mb-8'>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>No. Hp</TableHead>
                  <TableHead>Bagian</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-center'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {pagedStaffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                        Belum ada data staff
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedStaffs.map((staff, index) => {
                      const staffKey = getStaffKey(staff, index)
                      const activeRoutes = accessMap[staffKey] ?? []

                      return (
                        <TableRow
                          key={staffKey}
                          className="cursor-pointer"
                          onClick={() => handleStaffClick(staff)}
                        >
                          <TableCell className="flex items-center gap-3">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-500" />
                              </div>
                            <span>{staff.name}</span>
                          </TableCell>
                          <TableCell>{staff.phone_no}</TableCell>
                          <TableCell>{staff.department}</TableCell>
                          <TableCell>{staff.position}</TableCell>
                          <TableCell>{staff.staff_status}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    className='bg-white border border-gray-500 hover:bg-black cursor-pointer' 
                                    size="icon"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <LaptopMinimalCheck className="h-4 w-4 text-gray-500 hover:text-white" />
                                  </Button> 
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-56"
                                  align="end"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <div className="space-y-3">
                                    <div className="text-sm font-semibold">Akses Menu</div>
                                    <div className="space-y-2">
                                      {accessOptions.map((option) => (
                                        <label key={`${staffKey}-${option.id}`} className="flex items-center gap-2 text-sm">
                                          <Checkbox
                                            checked={activeRoutes.includes(option.route)}
                                            onCheckedChange={() => handleToggleAccess(staffKey, option.route)}
                                            onClick={(event) => event.stopPropagation()}
                                          />
                                          <span>{option.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
              </TableBody>
            </Table>

          <div className='flex justify-between mb-12'>
            <div className='flex justify-start'>
              <h1>Menampilkan: {pageStart} - {pageEnd} dari {totalCount} Pengguna</h1>
            </div>
            <div className='flex justify-end'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={safeCurrentPage === 1}
                      onClick={(event) => {
                        event.preventDefault()
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }}
                    />
                  </PaginationItem>
                  {getPaginationItems(safeCurrentPage, totalPages).map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {item === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={item === safeCurrentPage}
                          onClick={(event) => {
                            event.preventDefault()
                            setCurrentPage(item)
                          }}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={safeCurrentPage === totalPages}
                      onClick={(event) => {
                        event.preventDefault()
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-full w-full max-w-[100vw] md:max-w-3xl ml-auto">
            <DrawerHeader className="border-b px-4 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DrawerTitle className="text-xl font-bold">
                  {selectedStaff?.name ?? "Detail Staff"}
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Tutup detail staff">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {selectedStaff && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailRow label="Nama" value={selectedStaff.name} />
                    <DetailRow label="Departemen" value={selectedStaff.department} />
                    <DetailRow label="Posisi" value={selectedStaff.position} />
                    {/* <DetailRow label="No. KTP" value={selectedStaff.ktp_no} /> */}
                    <DetailRow label="Status" value={selectedStaff.staff_status} />
                    <DetailRow label="User" value={selectedStaff.user_id} />
                    <DetailRow label="No. HP" value={selectedStaff.phone_no} />
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-base font-normal">{value}</div>
    </div>
  )
}

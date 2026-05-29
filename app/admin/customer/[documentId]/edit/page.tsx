"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import MapCoordinatePicker from '@/components/custom/Coordinate-input'
import { Coordinate } from '@/types/coordinate'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useParams, useRouter } from 'next/navigation'
import { fetchCustomerForEdit, updateCustomer } from '@/features/admin/update-customer'
import { getCurrentUser } from '@/features/admin/create-order'
import { fetchStaffs, type Staff } from '@/features/admin/get-staff'
import { DEFAULT_COORDINATE } from '@/const/default-coordinates'
import { CustomerFormValues } from '@/types/admin/customer'
import { CurrentUser } from '@/types/admin/user'

export default function page() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.documentId as string
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [salesStaffOptions, setSalesStaffOptions] = useState<Staff[]>([])
  const [staffOptionsLoading, setStaffOptionsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState<Coordinate>(DEFAULT_COORDINATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)
  const [formValues, setFormValues] = useState<CustomerFormValues>({
    salesName: '',
    staffId: '',
    gender: '',
    name: '',
    companyName: '',
    phoneNo: '',
    company: '',
    address: '',
  })

  const normalizeRoleValue = (value: string | null | undefined) =>
    value?.toLowerCase() ?? ""

  const normalizedPosition = normalizeRoleValue(currentUser?.staff?.position)
  const normalizedDepartment = normalizeRoleValue(currentUser?.staff?.department)
  const isAdminOperational =
    normalizedPosition === "admin_operational" && normalizedDepartment === "operational"
  const isSalesMarketing =
    normalizedPosition === "sales" && normalizedDepartment === "marketing"

  useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const user = await getCurrentUser()
      if (!isMounted) return
      setCurrentUser(user)
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isAdminOperational && !isSalesMarketing) {
      setSalesStaffOptions([])
      return
    }

    let isMounted = true

    const loadSalesStaffs = async () => {
      setStaffOptionsLoading(true)
      try {
        const staffs = await fetchStaffs()
        const salesStaffs = staffs.filter((staff) => {
          const position = normalizeRoleValue(staff.position)
          const department = normalizeRoleValue(staff.department)
          return position === "sales" && department === "marketing" && staff.id !== null
        })
        if (isMounted) {
          setSalesStaffOptions(salesStaffs)
        }
      } finally {
        if (isMounted) {
          setStaffOptionsLoading(false)
        }
      }
    }

    loadSalesStaffs()

    return () => {
      isMounted = false
    }
  }, [isAdminOperational, isSalesMarketing])

  useEffect(() => {
    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    let isMounted = true

    const loadCustomer = async () => {
      setIsLoadingCustomer(true)
      try {
        const customer = await fetchCustomerForEdit(documentId)
        if (!isMounted) return
        setFormValues({
          salesName: customer.sales_name || '',
          staffId: customer.staffId || '',
          gender: customer.gender || '',
          name: customer.name || '',
          companyName: customer.company_name || '',
          phoneNo: customer.phone_no || '',
          company: customer.company || '',
          address: customer.address || '',
        })
        setCoordinates(customer.coordinates ?? DEFAULT_COORDINATE)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memuat data customer"
        toast.error(message)
      } finally {
        if (isMounted) {
          setIsLoadingCustomer(false)
        }
      }
    }

    loadCustomer()

    return () => {
      isMounted = false
    }
  }, [documentId])

  useEffect(() => {
    if (!isAdminOperational) return
    if (!formValues.staffId) return

    const selectedId = Number(formValues.staffId)
    const selectedName = salesStaffOptions.find((staff) => staff.id === selectedId)?.name ?? ''
    if (!selectedName) return

    setFormValues((prev) => (prev.salesName === selectedName ? prev : { ...prev, salesName: selectedName }))
  }, [formValues.staffId, isAdminOperational, salesStaffOptions])

  useEffect(() => {
    if (!isSalesMarketing) return
    if (formValues.salesName.trim()) return
    const staffName = salesStaffOptions.find((staff) => staff.id === currentUser?.staff?.id)?.name ?? ''
    if (!staffName) return

    setFormValues((prev) => ({ ...prev, salesName: staffName }))
  }, [currentUser?.staff?.id, formValues.salesName, isSalesMarketing, salesStaffOptions])

  const updateField = <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const normalizePhoneNumber = (value: string) => {
    const trimmed = value.replace(/\s+/g, '')
    if (trimmed.startsWith('08')) {
      return `628${trimmed.slice(2)}`
    }
    return trimmed
  }

  const toNullable = (value: string) => {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
  }

  const handleSubmit = async () => {
    if (isSubmitting || isLoadingCustomer) return

    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    const requiredMap: Array<[keyof CustomerFormValues, string]> = [
      ['salesName', 'Nama Sales'],
      ['gender', 'Gender'],
      ['name', 'Nama'],
      ['companyName', 'Nama Instansi/Perusahaan'],
      ['phoneNo', 'No. HP'],
      ['company', 'Instansi'],
      ['address', 'Alamat'],
    ]
    if (isAdminOperational) {
      requiredMap[0] = ['staffId', 'Nama Sales']
    }

    const missingFields = requiredMap
      .filter(([key]) => !formValues[key].trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      toast.error(`Lengkapi field: ${missingFields.join(', ')}`)
      return
    }

    const staffIdValue = formValues.staffId.trim()
    const staffIdNumber = staffIdValue ? Number(staffIdValue) : null
    if (isAdminOperational && (!staffIdNumber || Number.isNaN(staffIdNumber))) {
      toast.error('Nama sales tidak valid')
      return
    }
    if (isSalesMarketing && staffIdValue && Number.isNaN(staffIdNumber)) {
      toast.error('Staff sales tidak valid')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        gender: toNullable(formValues.gender),
        name: toNullable(formValues.name),
        company_name: toNullable(formValues.companyName),
        phone_no: toNullable(formValues.phoneNo),
        company: toNullable(formValues.company),
        address: toNullable(formValues.address),
        latitude: coordinates.lat.toString(),
        longitude: coordinates.lng.toString(),
        staff_id: staffIdValue ? staffIdNumber : undefined,
      }

      const result = await updateCustomer(documentId, payload)

      if (!result.success) {
        throw new Error(result.error || 'Gagal memperbarui customer')
      }

      toast.success('Customer berhasil diperbarui')
      router.push('/admin/customer')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui customer'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className='w-full bg-[#F5F5F5]'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 py-4 px-4 max-w-7xl border-black w-full'>
            <h1 className='font-bold text-xl'>Edit Customer</h1>
        </div>
        <div className='container w-full md:w-full mx-auto px-4 py-2'>
            <div className='bg-white mt-2 flex flex-col px-4 md:px-8 rounded-lg'>
                <div className='w-full mb-6 md:mb-8 py-4 md:py-6'>
                    {isAdminOperational ? (
                        <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                            <Label htmlFor="staff_id">Nama Sales</Label>
                            <Select
                                value={formValues.staffId}
                                onValueChange={(value) => updateField('staffId', value)}
                                disabled={staffOptionsLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={staffOptionsLoading ? "Memuat..." : "Pilih nama sales"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Nama Sales</SelectLabel>
                                        {salesStaffOptions.length === 0 ? (
                                            <div className="px-2 py-1.5 text-sm text-gray-500">Belum ada staff sales</div>
                                        ) : (
                                            salesStaffOptions.map((staff) => (
                                                <SelectItem key={staff.id ?? staff.documentId ?? staff.name} value={String(staff.id)}>
                                                    {staff.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                            <Label htmlFor="sales_name">Nama Sales</Label>
                            <Input
                                type="text"
                                name="sales_name"
                                id="sales_name"
                                placeholder="Masukkan nama sales"
                                required
                                value={formValues.salesName}
                                onChange={(e) => updateField('salesName', e.target.value)}
                                disabled={isSalesMarketing && formValues.salesName.trim() !== ""}
                            />
                        </div>
                    )}
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formValues.gender} onValueChange={(value) => updateField('gender', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Gender</SelectLabel>
                                    <SelectItem value="kak">Kak</SelectItem>
                                    <SelectItem value="bang">Bang</SelectItem>
                                    <SelectItem value="bu">Bu</SelectItem>
                                    <SelectItem value="bp">Bp</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Masukkan nama customer"
                            required
                            value={formValues.name}
                            onChange={(e) => updateField('name', e.target.value)}
                        />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="company_name">Nama Instansi/Perusahaan</Label>
                        <Input
                            type="text"
                            name="company_name"
                            id="company_name"
                            placeholder="Masukkan nama instansi"
                            required
                            value={formValues.companyName}
                            onChange={(e) => updateField('companyName', e.target.value)}
                        />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="phone_no">no. HP*</Label>
                        <Input
                            type="text"
                            name="phone_no"
                            id="phone_no"
                            placeholder="Masukkan no. HP"
                            required
                            value={formValues.phoneNo}
                            onChange={(e) => updateField('phoneNo', normalizePhoneNumber(e.target.value))}
                        />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="company">Instansi</Label>
                        <Select value={formValues.company} onValueChange={(value) => updateField('company', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Gender</SelectLabel>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="bumn">BUMN</SelectItem>
                                    <SelectItem value="swasta">Swasta</SelectItem>
                                    <SelectItem value="pariwisata">Pariwisata</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="address">Alamat</Label>
                        <Input
                            type="text"
                            name="address"
                            id="address"
                            placeholder="Masukkan alamat"
                            required
                            value={formValues.address}
                            onChange={(e) => updateField('address', e.target.value)}
                        />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <MapCoordinatePicker value={coordinates} onChange={setCoordinates} />
                    </div>
                    <Button 
                        className='cursor-pointer w-full md:w-auto bg-gray-400 text-white'
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoadingCustomer}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}

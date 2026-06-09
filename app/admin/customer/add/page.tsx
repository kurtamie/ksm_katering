"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import MapCoordinatePicker from '@/components/custom/Coordinate-input'
import { Coordinate } from '@/types/coordinate'
import { createCustomer } from '@/features/admin/create-customer'
import { getCurrentUser } from '@/features/admin/create-order'
import { fetchStaffs, type Staff } from '@/features/admin/get-staff'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useRouter } from 'next/navigation'
import { CustomerFormValues } from '@/types/admin/customer'
import { DEFAULT_COORDINATE } from '@/const/default-coordinates'
import { CurrentUser } from '@/types/admin/user'

export default function page() {
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [salesStaffOptions, setSalesStaffOptions] = useState<Staff[]>([])
    const [staffOptionsLoading, setStaffOptionsLoading] = useState(false)
    const [coordinates, setCoordinates] = useState<Coordinate>(DEFAULT_COORDINATE)
    const [isSubmitting, setIsSubmitting] = useState(false)
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
    }, [])

    useEffect(() => {
        if (!isSalesMarketing || !currentUser?.staff?.id) return

        const staffIdValue = String(currentUser.staff.id)
        const staffName = salesStaffOptions.find((staff) => staff.id === currentUser.staff?.id)?.name ?? ''

        setFormValues((prev) => ({
            ...prev,
            staffId: staffIdValue,
            salesName: staffName || prev.salesName,
        }))
    }, [currentUser?.staff?.id, isSalesMarketing, salesStaffOptions])

    useEffect(() => {
        if (!formValues.staffId) return

        const selectedId = Number(formValues.staffId)
        const selectedName = salesStaffOptions.find((staff) => staff.id === selectedId)?.name ?? ''
        if (!selectedName) return

        setFormValues((prev) => (prev.salesName === selectedName ? prev : { ...prev, salesName: selectedName }))
    }, [formValues.staffId, salesStaffOptions])

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
        if (isSubmitting) return

        const requiredMap: Array<[keyof CustomerFormValues, string]> = [
            ['staffId', 'Nama Sales'],
            ['gender', 'Sapaan Pelanggan'],
            ['name', 'Nama'],
            ['companyName', 'Nama Instansi/Perusahaan'],
            ['phoneNo', 'No HP'],
            ['company', 'Instansi'],
            ['address', 'Alamat'],
        ]

        const missingFields = requiredMap
            .filter(([key]) => !formValues[key].trim())
            .map(([, label]) => label)

        if (missingFields.length > 0) {
            toast.error(`Lengkapi field: ${missingFields.join(', ')}`)
            return
        }

        const staffIdValue = formValues.staffId.trim()
        const staffIdNumber = staffIdValue ? Number(staffIdValue) : null
        if (!staffIdNumber || Number.isNaN(staffIdNumber)) {
            toast.error('Nama sales tidak valid')
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
                staff_id: staffIdNumber,
                user_id: null,
                orders: null,
            }

            const result = await createCustomer(payload)

            if (!result.success) {
            throw new Error(result.error || 'Gagal menyimpan pelanggan')
            }

            toast.success('Pelanggan berhasil dibuat')
            router.push('/admin/customer')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menyimpan pelanggan'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }
    
  return (
    <div className='w-full bg-[#F5F5F5]'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 py-4 px-4 max-w-7xl border-black w-full'>
            <h1 className='font-bold text-xl'>Tambah Pelanggan</h1>
        </div>
        <div className='container w-full md:w-full mx-auto px-4 py-2'>
            <div className='bg-white mt-2 flex flex-col px-4 md:px-8 rounded-lg'>
                <div className='w-full mb-6 md:mb-8 py-4 md:py-6'>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="staff_id">Nama Sales</Label>
                        <Select
                            value={formValues.staffId}
                            onValueChange={(value) => updateField('staffId', value)}
                            disabled={staffOptionsLoading || isSalesMarketing}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={staffOptionsLoading ? "Memuat..." : "Pilih nama sales"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Nama Sales</SelectLabel>
                                    {salesStaffOptions.length === 0 ? (
                                        <div className="px-2 py-1.5 text-sm text-gray-500">Belum ada staf sales</div>
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
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Sapaan Pelanggan</Label>
                        <Select value={formValues.gender} onValueChange={(value) => updateField('gender', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih sapaan pelanggan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sapaan Pelanggan</SelectLabel>
                                    <SelectItem value="kak">Kak</SelectItem>
                                    <SelectItem value="bang">Bang</SelectItem>
                                    <SelectItem value="bu">Bu</SelectItem>
                                    <SelectItem value="bp">Bp</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Nama</Label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Masukkan nama pelanggan"
                            required
                            value={formValues.name}
                            onChange={(e) => updateField('name', e.target.value)}
                        />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Nama Instansi/Perusahaan</Label>
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
                        <Label htmlFor="nama">No HP *</Label>
                        <Input
                            type="text"
                            name="phone_no"
                            id="phone_no"
                            placeholder="Masukkan No HP"
                            required
                            value={formValues.phoneNo}
                            onChange={(e) => updateField('phoneNo', normalizePhoneNumber(e.target.value))}
                        />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Instansi</Label>
                        <Select value={formValues.company} onValueChange={(value) => updateField('company', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih instansi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Instansi</SelectLabel>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="bumn">BUMN</SelectItem>
                                    <SelectItem value="swasta">Swasta</SelectItem>
                                    <SelectItem value="pariwisata">Pariwisata</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Alamat</Label>
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
                        className='cursor-pointer w-full md:w-auto'
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'SIMPAN'}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}

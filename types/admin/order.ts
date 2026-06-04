export type CustomerOption = {
  id: number
  name: string
  phone_no: string
  staff_id?: number | null
  staff_document_id?: string | null
}

export type PackageOption = {
  id: number
  package_name: string
  subname?: string
  product?: string
  price?: string
}

export type OrderFormValues = {
    orderNo: string
    staffId: string
  customerId: string
  customerType: string
  executorTeam: string
  supplier: string
  product: string
  packageId: string
  qty: string
  sellingPrice: string
  brokerFee: string
  priceForKsm: string
  minSellingPrice: string
  amount: string
  deliveryCharge: string
  totalAmount: string
  payment1: string
  payment2: string
  payment3: string
  deliveryNote: string
  arriveTime: string
  leaveTime: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  rice: string
  mainDish: string
  mainDish2: string
  mainDish3: string
  additionalDish: string
  vegetable: string
  sauce: string
  chip: string
  fruit: string
  mineralWater: string
  box: string
  pudding: string
  snack: string
  snack2: string
  snack3: string
  snack4: string
  travelLetterNo: string
  staffDriverId: string
}

export type OrderDishOptions = {
  rice: string[]
  mainDish: string[]
  additionalDish: string[]
  vegetable: string[]
  sauce: string[]
  chip: string[]
  fruit: string[]
  mineralWater: string[]
  box: string[]
}

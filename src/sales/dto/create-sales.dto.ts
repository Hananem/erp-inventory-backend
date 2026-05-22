export class CreateSalesDto {
  customerId: string;

  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}
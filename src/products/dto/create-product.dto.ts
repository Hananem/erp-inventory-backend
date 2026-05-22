export class CreateProductDto {
  code: string;
  name: string;
  description?: string;
  barcode?: string;
  unit?: string;
  minStock?: number;
  categoryId: string;
}
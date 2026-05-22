export class CreateInvoiceDto {
  type: 'SALES' | 'PURCHASE';

  salesOrderId?: string;
  purchaseOrderId?: string;
}
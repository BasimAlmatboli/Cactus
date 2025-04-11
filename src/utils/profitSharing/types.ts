export interface ProfitShare {
  yassirShare: number;
  basimShare: number;
}

export interface ItemProfitDetails {
  total: number;
  revenueProportion: number;
  expenseShare: number;
  cost: number;
  netProfit: number;
  yassirShare: number;
  basimShare: number;
}

export interface TotalProfitShare {
  totalWithShipping: number;
  itemShares: ItemProfitDetails[];
  totalYassirShare: number;
  totalBasimShare: number;
}
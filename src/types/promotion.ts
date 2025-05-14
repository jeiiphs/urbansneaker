export interface BasePromotion {
  title: string;
  description: string;
  discountPercentage: number;
  validUntil: string;
  imageUrl?: string;
}

export interface Promotion extends BasePromotion {
  id: string;
}

export interface CreatePromotionDTO extends BasePromotion {}
export interface UpdatePromotionDTO extends Partial<BasePromotion> {}
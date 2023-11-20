export class Product {
  id?: string;
  name?: string;
  description?: string;
  images: ProductImage[] = [];
  categories?: string[];
  price?: number;
  taxPercentage?: number;
  unit?: string;
  availability?: boolean;
}

export class ProductImage {
  url?: string;
  name?: string;
  altText?: string;
  description?: string;
}

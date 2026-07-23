export interface Deal {
  category: HomeCategory;
  discount: number;
}

export interface HomeData {
  id?: string;
  grid: HomeCategory[];
  shopByCategories: HomeCategory[];
  electricCategories: HomeCategory[];
  deals: Deal[];
  dealCategories: HomeCategory[];
}

export interface HomeCategory {
  id?: string;
  categoryId: string;
  section: string;
  name: string;
  image: string;
  parentCategoryId?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}


// export interface Deal {
//     category: HomeCategory;
//     discount: number;
// }

// export interface HomeData {
//     id?: number;
//     grid: HomeCategory[];
//     shopByCategories: HomeCategory[];
//     electricCategories: HomeCategory[];
//     deals: Deal[];
//     dealCategories: HomeCategory[];
// }

// export interface HomeCategory {
//     // _id?: string;
//     id?:number;
//     categoryId: string;
//     section?: string;
//     name?: string;
//     image: string;
//     parentCategoryId?: string;
// }

// interface Deal{
//   category:HomeCategory;
//   discount:number;
// }

// export interface HomeData {
//   id: number; 
//   grid: HomeCategory[]; 
//   shopByCategories: HomeCategory[]; 
//   electricCategories: HomeCategory[]; 
//   deals: Deal[]; 
//   dealCategories:HomeCategory[];
// }
  
//   export interface HomeCategory {
//     id?:number;
//     categoryId: string;
//     section?: string;
//     name?: string;
//     image: string;
//     parentCategoryId?: string;
//   }
  
export interface ReviewUserRef {
    id: string;
    fullName: string;
    profileImage?: string | null;
}

export interface ReviewProductRef {
    id: string;
    title?: string;
    images?: string[];
    sellingPrice?: number;
}

export interface Review {
    id: string;
    reviewText: string;
    rating: number;
    user: ReviewUserRef;
    product: ReviewProductRef | string;
    productImages: string[];
    createdAt: string;
    updatedAt: string;
}
  
export interface CreateReviewRequest {
    reviewText: string;
    rating: number;
    productImages: string[];
}
  
  export interface ApiResponse {
    message: string;
    success: boolean;
  }
  
  export interface ReviewState {
    reviews: Review[];
    myReviews: Review[];
    fetchLoading: boolean;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    uploadLoading: boolean;
    error: string | null;
    reviewCreated: boolean;
    reviewUpdated: boolean;
    reviewDeleted: boolean;
  }
  
interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverColor: string;
  coverUrl: string;
  //videoUrl: string;
  summary: string;
  createdAt: Date | null;
}

interface AuthCredentials {
  fullName: string;
  email: string;
  password: string;
  universityId: number;
  universityCard: string;
}

interface BookParams {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  fileUrl: string;
  summary: string;
  category: string;
  subcategory: string;
  language: string;
  translated: boolean;
  translator?: string;
  keywords?: string[];
  topics?: string[];
  uploader: string;
  packageUrl: string;
  tradition: string;
  audience: string;
}

interface BorrowBookParams {
  bookId: string;
  userId: string;
}

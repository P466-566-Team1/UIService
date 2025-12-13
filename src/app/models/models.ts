export interface Language {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Topic {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  imageUrl: string;
  imageId?: number;
  number: number;
}

export interface Label {
  id: string | number;
  number?: number;
  xCoordinate: number;  // Match backend DTO
  yCoordinate: number;  // Match backend DTO
  englishText: string;
  translatedText: string;
  audioId?: number;
  vocabularyId?: number;
  topicId: string | number;
  categoryId?: number;
  // Legacy fields for backward compatibility
  x?: number;  // Alias for xCoordinate
  y?: number;  // Alias for yCoordinate
  width?: number;
  height?: number;
  translations?: { [languageCode: string]: string };
  audioUrls?: { [languageCode: string]: string };
}
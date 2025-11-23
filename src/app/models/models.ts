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
  name: string;
  imageUrl: string;
}

export interface Label {
  id: string;
  topicId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  translations: { [languageCode: string]: string };
  audioUrls: { [languageCode: string]: string };
}
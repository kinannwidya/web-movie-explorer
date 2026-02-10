export interface Content {
  _id: string;
  title: string;
  poster?: string;
  landscapePoster?: string;
  description?: string;
  year?: number;
  genre?: string;
  type?: string;
  rating?: number;
  tags?: string[];
  ageRating?: string;
  popularityRank?: number;
  releaseDate?: string;
  heroBg?: string | null;
  heroBgPublicId?: string | null;
  heroCharacter?: string | null;
  heroCharacterPublicId?: string | null;
  heroTitle?: string | null;
  heroTitlePublicId?: string | null;
}

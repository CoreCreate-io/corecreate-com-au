export interface SanityImage {
  _type: string;
  asset: {
    _ref: string;
    _type: string;
  };
  alt?: string;
}

export interface SanityImageWithCaption extends SanityImage {
  _key: string;
  caption?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  featuredImage?: SanityImage;
  featuredVideoEnabled?: boolean;
  featuredVideo?: {
    asset: {
      _ref: string;
      _type: string;
      url?: string;
    };
  };
  gallery?: {
    images?: Array<SanityImageWithCaption>;
    display?: 'stacked' | 'grid' | 'carousel' | 'masonry';
    zoom?: boolean;
  };
  projectField?: { _ref: string; slug?: { current: string }; title?: string };
  projectSector?: { _ref: string; slug?: { current: string }; title?: string };
  // Add the new subCategories field
  subCategories?: Array<{ _ref: string; slug?: { current: string }; title?: string }>;
  customTags?: string[];
  clientInfo?: { 
    clientName?: string;
    clientWebsite?: string;
  };
  featured?: boolean;
}

export interface ProjectsGridProps {
  projects: Project[];
  categories: string[];
  loading: boolean;
  initialProjectSlug?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  featuredImage?: SanityImage;
  overlayColor?: string;
  icon?: SanityImage;
}
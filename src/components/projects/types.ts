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
  slug?: { current: string };
  description?: string;
  featuredImage: SanityImage;
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
  projectField: { title: string };
  projectSector: { title: string };
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
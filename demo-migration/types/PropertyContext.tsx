import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MOCK_PROPERTIES } from '../services/mockDataService';
import { useAuth } from './AuthContext';

// Type definitions
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'SGD';
export type AreaUnit = 'sqft' | 'sqm' | 'acres' | 'hectares';
export type PropertyStatus =
  | 'online'
  | 'offline'
  | 'under_offer'
  | 'sold'
  | 'let'
  | 'draft'
  | 'published'
  | 'active'
  | 'available'
  | 'pending'
  | 'rented'
  | 'under_contract'
  | 'off_market'
  | 'coming_soon';
export type PropertyType = 'apartment' | 'house' | 'condo' | 'townhouse' | 'villa' | 'penthouse' | 'studio' | 'duplex' | 'triplex' | 'land' | 'commercial' | 'industrial' | 'office';
export type ListingType = 'sale' | 'rent' | 'lease' | 'short_term' | 'vacation';
export type FurnishingStatus = 'furnished' | 'semi_furnished' | 'unfurnished';
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'fair' | 'needs_renovation';
export type FacingDirection = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

// Helper to map country names to ISO codes
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Great Britain': 'GB',
  'England': 'GB',
  'United States': 'US',
  'USA': 'US',
  'United States of America': 'US',
  'India': 'IN',
  'United Arab Emirates': 'AE',
  'UAE': 'AE',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Spain': 'ES',
  'Italy': 'IT',
  'Japan': 'JP',
  'China': 'CN',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Thailand': 'TH',
  'Philippines': 'PH',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'South Africa': 'ZA',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Egypt': 'EG',
  'Saudi Arabia': 'SA',
  'Qatar': 'QA',
  'Kuwait': 'KW',
  'Bahrain': 'BH',
  'Oman': 'OM',
};

function getCountryCodeFromName(countryName: string | null | undefined): string {
  if (!countryName) return '';
  const normalized = countryName.trim();
  // Check exact match
  if (COUNTRY_NAME_TO_CODE[normalized]) {
    return COUNTRY_NAME_TO_CODE[normalized];
  }
  // Check case-insensitive match
  const lowerName = normalized.toLowerCase();
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (name.toLowerCase() === lowerName) {
      return code;
    }
  }
  return '';
}

export interface PriceInfo {
  amount: number;
  currency: CurrencyCode;
  negotiable: boolean;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  price?: PriceInfo;
  priceString?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;

  // Location
  location?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    cityId?: string;
    state?: string;
    stateId?: string;
    stateCode?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
    countryId?: string;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
    landmark?: string;
  };
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  // Dimensions
  dimensions?: {
    totalArea: number;
    carpetArea?: number;
    areaUnit: AreaUnit;
    floors?: number;
    floorNumber?: number;
    totalFloors?: number;
  };
  area?: number;

  // Rooms
  rooms?: {
    bedrooms: number;
    bathrooms: number;
    balconies?: number;
    parkingSpaces?: number;
  };
  bedrooms?: number;
  bathrooms?: number;

  // Features
  yearBuilt?: number;
  furnishing: FurnishingStatus;
  condition: PropertyCondition;
  facing?: FacingDirection;
  amenities: {
    interior: string[];
    exterior: string[];
    community: string[];
    security: string[];
    utilities: string[];
  };
  features?: string[];

  // Media
  media?: {
    images: { id: string; url: string; type: string; isPrimary?: boolean; order?: number; uploadedAt: string }[];
    videos: { id: string; url: string; type: string; order?: number; uploadedAt: string }[];
    floorPlans: any[];
    virtualTourUrl?: string;
  };
  images?: (File | string)[];
  videos?: (File | string)[];
  virtualTourUrl?: string;

  // Contact
  contact?: {
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    preferredContactMethod: 'email' | 'phone' | 'whatsapp' | 'any';
    company?: string;
    licenseNumber?: string;
  };
  contactName?: string;
  phoneNumber?: string;
  emailAddress?: string;

  // Terms
  availableFrom: string;
  minimumLease?: number;
  inclusions?: string;
  exclusions?: string;
  financial?: {
    deposit?: number;
    maintenanceCharges?: number;
    maintenanceFrequency?: string;
  };

  // Analytics
  analytics: {
    views: number;
    inquiries: number;
    favorites: number;
    shares: number;
  };

  // Flags & Meta
  propertyId?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  draft: boolean;
  featured?: boolean;
  verified?: boolean;
  premium?: boolean;
  version?: number;
}

export interface PropertyFilters {
  search?: string;
  propertyType?: PropertyType[];
  listingType?: ListingType[];
  status?: (PropertyStatus | string)[];
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  areaMin?: number;
  areaMax?: number;
  city?: string;
  country?: string;
  furnishing?: FurnishingStatus[];
  featured?: boolean;
  verified?: boolean;
}

export type SortField = 'createdAt' | 'updatedAt' | 'price' | 'area' | 'bedrooms' | 'views' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PropertyContextType {
  properties: Property[];
  filteredProperties: Property[];
  selectedProperties: string[];
  filters: PropertyFilters;
  sort: SortOption;
  pagination: Pagination;
  loading: boolean;
  error: string | null;

  fetchProperties: () => Promise<void>;
  addProperty: (property: Partial<Property>) => Promise<Property | null>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<void>;
  deleteProperties: (ids: string[]) => Promise<void>;
  duplicateProperty: (id: string) => Promise<Property | null>;
  getProperty: (id: string) => Property | undefined;
  uploadImages: (files: File[]) => Promise<string[]>;
  uploadVideos: (files: File[]) => Promise<string[]>;

  selectProperty: (id: string) => void;
  deselectProperty: (id: string) => void;
  selectAllProperties: () => void;
  clearSelection: () => void;
  bulkUpdateStatus: (ids: string[], status: PropertyStatus) => Promise<void>;

  setFilters: (filters: PropertyFilters) => void;
  clearFilters: () => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  incrementViews: (id: string) => void;
  incrementInquiries: (id: string) => void;
  incrementShares: (id: string) => void;
  exportProperties: (format: 'csv' | 'json' | 'pdf', ids?: string[]) => void;
  formatPrice: (price: PriceInfo) => string;
  formatArea: (area: number, unit: AreaUnit) => string;
  getPropertyStats: () => { total: number; available: number; sold: number; rented: number; pending: number };
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within PropertyProvider');
  }
  return context;
};

// Currency formatters
const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
  EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
  GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }),
  INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),
  AED: new Intl.NumberFormat('ar-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }),
  CAD: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }),
  AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }),
  JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }),
  CNY: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }),
  SGD: new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }),
};

// Convert DB row to Property
const dbRowToProperty = (row: any): Property => {
  // Parse image URLs - handle different formats
  let imageUrls: string[] = [];

  // Check various possible image field names in the database
  if (row.image_urls) {
    // If image_urls is already an array
    if (Array.isArray(row.image_urls)) {
      imageUrls = row.image_urls;
    }
    // If image_urls is a JSON string
    else if (typeof row.image_urls === 'string') {
      try {
        const parsed = JSON.parse(row.image_urls);
        imageUrls = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If it's just a single URL string
        imageUrls = [row.image_urls];
      }
    }
  }
  // Check for 'images' field
  else if (row.images) {
    if (Array.isArray(row.images)) {
      imageUrls = row.images;
    } else if (typeof row.images === 'string') {
      try {
        const parsed = JSON.parse(row.images);
        imageUrls = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        imageUrls = [row.images];
      }
    }
  }
  // Check for single 'image' field
  else if (row.image) {
    if (typeof row.image === 'string') {
      try {
        const parsed = JSON.parse(row.image);
        imageUrls = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        imageUrls = [row.image];
      }
    } else if (Array.isArray(row.image)) {
      imageUrls = row.image;
    }
  }
  // Check for 'image_url' field
  else if (row.image_url) {
    imageUrls = [row.image_url];
  }
  // Check for 'photo' or 'thumbnail' fields
  else if (row.photo) {
    imageUrls = [row.photo];
  } else if (row.thumbnail_url) {
    imageUrls = [row.thumbnail_url];
  }

  // Note: Properties without images are normal and expected

  // Extract videos from database row
  let videoUrls: string[] = [];
  if (row.video_urls) {
    if (Array.isArray(row.video_urls)) {
      videoUrls = row.video_urls;
    }
    // If video_urls is a JSON string
    else if (typeof row.video_urls === 'string') {
      try {
        const parsed = JSON.parse(row.video_urls);
        videoUrls = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If it's just a single URL string
        videoUrls = [row.video_urls];
      }
    }
  }
  // Check for 'videos' field
  else if (row.videos) {
    if (Array.isArray(row.videos)) {
      videoUrls = row.videos;
    } else if (typeof row.videos === 'string') {
      try {
        const parsed = JSON.parse(row.videos);
        videoUrls = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        videoUrls = [row.videos];
      }
    }
  }

  return {
    id: row.id,
    title: row.title || '',
    description: row.description,
    shortDescription: row.short_description,
    price: {
      amount: parseFloat(row.price) || 0,
      currency: row.currency || 'USD',
      negotiable: row.negotiable || false,
    },
    priceString: `${row.currency || 'USD'} ${row.price}`,
    propertyType: row.property_type || 'apartment',
    listingType: row.listing_type || 'sale',
    status: row.status || 'online',
    location: {
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2,
      city: row.city,
      cityId: row.city_id,
      state: row.state,
      stateId: row.state_id,
      stateCode: row.state_code,
      postalCode: row.postcode,
      country: row.country,
      countryCode: getCountryCodeFromName(row.country),
      countryId: row.country_id,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      neighborhood: row.neighborhood,
      landmark: row.landmark,
    },
    address: row.address_line_1,
    city: row.city,
    state: row.state,
    zipCode: row.postcode,
    dimensions: {
      totalArea: parseFloat(row.area) || 0,
      areaUnit: row.area_unit || 'sqft',
      floorNumber: row.floor_number,
      totalFloors: row.total_floors,
    },
    area: parseFloat(row.area) || 0,
    rooms: {
      bedrooms: row.bedrooms || 0,
      bathrooms: row.bathrooms || 0,
      balconies: row.balconies || 0,
      parkingSpaces: row.parking_spaces || 0,
    },
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms || 0,
    yearBuilt: row.year_built,
    furnishing: row.furnishing || 'unfurnished',
    condition: row.condition || 'good',
    facing: row.facing,
    amenities: row.amenities || { interior: [], exterior: [], community: [], security: [], utilities: [] },
    features: [],
    media: {
      images: imageUrls.map((url: string, i: number) => ({
        id: `img-${i}`,
        url,
        type: 'image',
        isPrimary: i === 0,
        order: i,
        uploadedAt: row.created_at,
      })),
      videos: videoUrls.map((url: string, i: number) => ({
        id: `vid-${i}`,
        url,
        type: 'video',
        order: i,
        uploadedAt: row.created_at,
      })),
      floorPlans: [],
      virtualTourUrl: row.virtual_tour_url,
    },
    images: imageUrls,
    videos: videoUrls,
    virtualTourUrl: row.virtual_tour_url,
    contact: {
      name: row.contact_name || '',
      email: row.contact_email || '',
      phone: row.contact_phone || '',
      preferredContactMethod: 'any',
      company: row.company || '',
    },
    contactName: row.contact_name || '',
    phoneNumber: row.contact_phone || '',
    emailAddress: row.contact_email || '',
    availableFrom: row.available_from || new Date().toISOString(),
    minimumLease: row.minimum_lease,
    inclusions: row.inclusions,
    exclusions: row.exclusions,
    financial: {
      deposit: row.deposit ? parseFloat(row.deposit) : undefined,
      maintenanceCharges: row.maintenance_charges ? parseFloat(row.maintenance_charges) : undefined,
    },
    analytics: {
      views: row.views || 0,
      inquiries: row.inquiries || 0,
      favorites: row.favorites || 0,
      shares: row.shares || 0,
    },
    propertyId: `PROP-${row.id.slice(-6)}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    published: row.published ?? true,
    draft: row.draft || false,
    featured: row.featured || false,
    verified: row.verified || false,
    version: 1,
  };
};

// Convert Property to DB format
const propertyToDbRow = (p: Partial<Property>): any => {
  const row: any = {};

  if (p.title !== undefined) row.title = p.title;
  if (p.description !== undefined) row.description = p.description;
  if (p.shortDescription !== undefined) row.short_description = p.shortDescription;
  if (p.price !== undefined) row.price = p.price.amount;
  if (p.price?.currency !== undefined) row.currency = p.price.currency;
  if (p.price?.negotiable !== undefined) row.negotiable = p.price.negotiable;
  if (p.propertyType !== undefined) row.property_type = p.propertyType;
  if (p.listingType !== undefined) row.listing_type = p.listingType;
  if (p.status !== undefined) row.status = p.status;

  // Location
  if (p.location?.addressLine1 !== undefined) row.address_line_1 = p.location.addressLine1;
  if (p.location?.addressLine2 !== undefined) row.address_line_2 = p.location.addressLine2;
  if (p.location?.city !== undefined) row.city = p.location.city;
  if (p.location?.cityId !== undefined) row.city_id = p.location.cityId;
  if (p.location?.state !== undefined) row.state = p.location.state;
  if (p.location?.stateId !== undefined) row.state_id = p.location.stateId;
  if (p.location?.stateCode !== undefined) row.state_code = p.location.stateCode;
  if (p.location?.postalCode !== undefined) row.postcode = p.location.postalCode;
  if (p.location?.country !== undefined) row.country = p.location.country;
  if (p.location?.countryId !== undefined) row.country_id = p.location.countryId;
  // Note: country_code column doesn't exist in properties table, only country_id
  // if (p.location?.countryCode !== undefined) row.country_code = p.location.countryCode;
  if (p.location?.latitude !== undefined) row.latitude = p.location.latitude;
  if (p.location?.longitude !== undefined) row.longitude = p.location.longitude;
  if (p.location?.neighborhood !== undefined) row.neighborhood = p.location.neighborhood;
  if (p.location?.landmark !== undefined) row.landmark = p.location.landmark;

  // Legacy location fields
  if (p.address !== undefined) row.address_line_1 = p.address;
  if (p.city !== undefined) row.city = p.city;
  if (p.state !== undefined) row.state = p.state;
  if (p.zipCode !== undefined) row.postcode = p.zipCode;

  // Dimensions
  if (p.dimensions?.totalArea !== undefined) row.area = p.dimensions.totalArea;
  if (p.dimensions?.areaUnit !== undefined) row.area_unit = p.dimensions.areaUnit;
  if (p.dimensions?.floorNumber !== undefined) row.floor_number = p.dimensions.floorNumber;
  if (p.dimensions?.totalFloors !== undefined) row.total_floors = p.dimensions.totalFloors;
  if (p.area !== undefined) row.area = p.area;

  // Rooms
  if (p.rooms?.bedrooms !== undefined) row.bedrooms = p.rooms.bedrooms;
  if (p.rooms?.bathrooms !== undefined) row.bathrooms = p.rooms.bathrooms;
  if (p.rooms?.balconies !== undefined) row.balconies = p.rooms.balconies;
  if (p.rooms?.parkingSpaces !== undefined) row.parking_spaces = p.rooms.parkingSpaces;
  if (p.bedrooms !== undefined) row.bedrooms = p.bedrooms;
  if (p.bathrooms !== undefined) row.bathrooms = p.bathrooms;

  // Features
  if (p.yearBuilt !== undefined) row.year_built = p.yearBuilt;
  if (p.furnishing !== undefined) row.furnishing = p.furnishing;
  if (p.condition !== undefined) row.condition = p.condition;
  if (p.facing !== undefined) row.facing = p.facing;
  if (p.amenities !== undefined) row.amenities = p.amenities;

  // Media
  if (p.images !== undefined) {
    row.image_urls = p.images.filter((img): img is string => typeof img === 'string');
  }
  if (p.videos !== undefined) {
    row.video_urls = p.videos.filter((vid): vid is string => typeof vid === 'string');
  }
  if (p.media?.videos !== undefined) {
    row.video_urls = p.media.videos.map(vid => vid.url);
  }
  if (p.virtualTourUrl !== undefined) row.virtual_tour_url = p.virtualTourUrl;
  if (p.media?.virtualTourUrl !== undefined) row.virtual_tour_url = p.media.virtualTourUrl;

  // Contact - database uses contact_name, contact_email, contact_phone, company
  if (p.contact?.name !== undefined) row.contact_name = p.contact.name;
  if (p.contact?.email !== undefined) row.contact_email = p.contact.email;
  if (p.contact?.phone !== undefined) row.contact_phone = p.contact.phone;
  if (p.contact?.company !== undefined) row.company = p.contact.company;
  if (p.contactName !== undefined) row.contact_name = p.contactName;
  if (p.emailAddress !== undefined) row.contact_email = p.emailAddress;
  if (p.phoneNumber !== undefined) row.contact_phone = p.phoneNumber;

  // Terms
  if (p.availableFrom !== undefined) row.available_from = p.availableFrom;
  if (p.minimumLease !== undefined) row.minimum_lease = p.minimumLease;
  if (p.inclusions !== undefined) row.inclusions = p.inclusions;
  if (p.exclusions !== undefined) row.exclusions = p.exclusions;
  if (p.financial?.deposit !== undefined) row.deposit = p.financial.deposit;
  if (p.financial?.maintenanceCharges !== undefined) row.maintenance_charges = p.financial.maintenanceCharges;

  // Flags
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.verified !== undefined) row.verified = p.verified;
  if (p.published !== undefined) row.published = p.published;
  if (p.draft !== undefined) row.draft = p.draft;

  return row;
};

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const { getRole, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<PropertyFilters>({});
  const [sort, setSort] = useState<SortOption>({ field: 'createdAt', order: 'desc' });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties from Supabase
  const fetchProperties = useCallback(async () => {
    const isDev = import.meta.env.DEV;
    const role = getRole();
    const isManagerPath = typeof window !== 'undefined' && window.location.pathname.includes('/manager');
    const isManager = role === 'manager' || role === 'admin' || isManagerPath;

    // In development mode, if we are in a manager context, use mock data
    if (isDev && isManager) {
      console.log('🧪 PropertyContext: Using mock properties for manager in development');
      const mapped = MOCK_PROPERTIES.map(dbRowToProperty);
      setProperties(mapped);
      setLoading(false);
      return;
    }

    if (!supabase) {
      console.warn('PropertyContext: Supabase client not initialized');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await (supabase as SupabaseClient).auth.getUser();

      let query = (supabase as SupabaseClient).from('properties').select('*');

      if (user) {
        query = query.eq('agent_id', user.id);
      }

      const sortColumn = sort.field === 'createdAt' ? 'created_at' : sort.field === 'updatedAt' ? 'updated_at' : sort.field;
      query = query.order(sortColumn, { ascending: sort.order === 'asc' });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const mapped = (data || []).map(dbRowToProperty);
      setProperties(mapped);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [sort, getRole]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Filter properties
  const filteredProperties = useCallback(() => {
    let result = [...properties];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.city?.toLowerCase().includes(s)
      );
    }

    if (filters.propertyType?.length) {
      result = result.filter(p => filters.propertyType!.includes(p.propertyType));
    }

    if (filters.listingType?.length) {
      result = result.filter(p => filters.listingType!.includes(p.listingType));
    }

    if (filters.status?.length) {
      result = result.filter(p => filters.status!.includes(p.status));
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      result = result.filter(p => {
        const price = p.price?.amount || 0;
        const minOk = filters.priceMin === undefined || price >= filters.priceMin;
        const maxOk = filters.priceMax === undefined || price <= filters.priceMax;
        return minOk && maxOk;
      });
    }

    if (filters.bedroomsMin !== undefined) {
      result = result.filter(p => (p.rooms?.bedrooms || p.bedrooms || 0) >= filters.bedroomsMin!);
    }

    if (filters.city) {
      result = result.filter(p => p.city?.toLowerCase().includes(filters.city!.toLowerCase()));
    }

    if (filters.featured !== undefined) {
      result = result.filter(p => p.featured === filters.featured);
    }

    return result;
  }, [properties, filters]);

  const filtered = filteredProperties();

  // Apply client-side sorting to filtered results
  const sortedAndFiltered = useMemo(() => {
    const result = [...filtered];

    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'price':
          aValue = a.price?.amount || 0;
          bValue = b.price?.amount || 0;
          break;
        case 'area':
          aValue = a.area || 0;
          bValue = b.area || 0;
          break;
        case 'bedrooms':
          aValue = a.bedrooms || 0;
          bValue = b.bedrooms || 0;
          break;
        case 'views':
          aValue = a.analytics?.views || 0;
          bValue = b.analytics?.views || 0;
          break;
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt || 0).getTime();
          bValue = new Date(b.updatedAt || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [filtered, sort]);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: sortedAndFiltered.length,
      totalPages: Math.ceil(sortedAndFiltered.length / prev.limit),
    }));
  }, [sortedAndFiltered.length, pagination.limit]);

  const paginatedProperties = sortedAndFiltered.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Upload images
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data: { user } } = await (supabase as SupabaseClient).auth.getUser();
    if (!user) throw new Error('Must be logged in to upload images');

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await (supabase as SupabaseClient).storage.from('property-images').upload(fileName, file);
      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = (supabase as SupabaseClient).storage.from('property-images').getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  // Upload videos
  const uploadVideos = async (files: File[]): Promise<string[]> => {
    console.log('[DEBUG] uploadVideos called', { filesCount: files.length });
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data: { user } } = await (supabase as SupabaseClient).auth.getUser();
    if (!user) throw new Error('Must be logged in to upload videos');

    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        console.log('[DEBUG] Processing video file', { fileName: file.name, fileSize: file.size, fileType: file.type });
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        let publicUrl: string | null = null;
        let bucketUsed: string | null = null;
        let uploadSucceeded = false;

        // Try property-videos bucket first (dedicated for videos)
        console.log('[DEBUG] Attempting upload to property-videos bucket...');
        const { error: videoError } = await (supabase as SupabaseClient).storage.from('property-videos').upload(fileName, file, {
          contentType: file.type || 'video/mp4',
          cacheControl: '3600',
        });

        if (!videoError) {
          const { data: { publicUrl: videoUrl } } = (supabase as SupabaseClient).storage.from('property-videos').getPublicUrl(fileName);
          publicUrl = videoUrl;
          bucketUsed = 'property-videos';
          uploadSucceeded = true;
          console.log('[DEBUG] ✅ Video uploaded to property-videos bucket', { url: publicUrl?.substring(0, 50) + '...' });
        } else {
          console.warn('[DEBUG] ⚠️ property-videos bucket failed:', videoError.message);

          // Try property-images as fallback (even though it may reject video mime types)
          console.log('[DEBUG] Attempting upload to property-images bucket (fallback)...');
          const { error: imageError } = await (supabase as SupabaseClient).storage.from('property-images').upload(fileName, file, {
            contentType: file.type || 'video/mp4',
            cacheControl: '3600',
          });

          if (!imageError) {
            const { data: { publicUrl: imageUrl } } = (supabase as SupabaseClient).storage.from('property-images').getPublicUrl(fileName);
            publicUrl = imageUrl;
            bucketUsed = 'property-images';
            uploadSucceeded = true;
            console.log('[DEBUG] ✅ Video uploaded to property-images bucket (fallback)', { url: publicUrl?.substring(0, 50) + '...' });
          } else {
            console.warn('[DEBUG] ⚠️ property-images bucket also failed:', imageError.message);
          }
        }

        // If both buckets failed, use base64 as fallback (for small videos only)
        if (!uploadSucceeded) {
          console.warn('[DEBUG] Both storage buckets failed, attempting base64 fallback for video:', file.name, { sizeMB: (file.size / 1024 / 1024).toFixed(2) });

          if (file.size > 10 * 1024 * 1024) { // 10MB limit for base64
            throw new Error(
              `Video "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB) for base64 storage. ` +
              'Please create the "property-videos" bucket in Supabase Storage. ' +
              'See QUICK_VIDEO_BUCKET_SETUP.md for instructions.'
            );
          }

          try {
            // Convert to base64 as fallback
            publicUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                console.log('[DEBUG] ✅ Video converted to base64', { sizeMB: (file.size / 1024 / 1024).toFixed(2), base64Length: result.length });
                resolve(result);
              };
              reader.onerror = (err) => {
                console.error('[DEBUG] ❌ FileReader error:', err);
                reject(new Error('Failed to read video file for base64 conversion'));
              };
              reader.readAsDataURL(file);
            });
            bucketUsed = 'base64';
            uploadSucceeded = true;
            console.log('[DEBUG] ✅ Video stored as base64 (fallback)', { size: file.size, urlLength: publicUrl.length });
          } catch (base64Error: any) {
            console.error('[DEBUG] ❌ Base64 conversion failed:', base64Error);
            throw new Error(
              `Failed to upload video "${file.name}": All storage methods failed. ` +
              `Storage errors: ${videoError?.message || 'unknown'}, ${imageError?.message || 'unknown'}. ` +
              `Base64 error: ${base64Error?.message || 'unknown'}. ` +
              'Please create the "property-videos" bucket in Supabase Storage. See QUICK_VIDEO_BUCKET_SETUP.md for instructions.'
            );
          }
        }

        if (publicUrl && uploadSucceeded) {
          uploadedUrls.push(publicUrl);
          console.log('[DEBUG] ✅ Video URL added to list', { bucketUsed, urlLength: publicUrl.length, totalUploaded: uploadedUrls.length });
        } else {
          console.error('[DEBUG] ❌ No URL generated for video:', file.name);
          throw new Error(`Failed to generate URL for video "${file.name}"`);
        }
      } catch (fileError: any) {
        console.error('[DEBUG] ❌ Error processing video file:', file.name, fileError);
        // If file is small enough, try base64 as last resort
        if (file.size <= 10 * 1024 * 1024) {
          try {
            console.log('[DEBUG] Attempting base64 fallback for failed file:', file.name);
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            uploadedUrls.push(base64);
            console.log('[DEBUG] ✅ Base64 fallback succeeded for:', file.name);
          } catch (base64Error: any) {
            console.error('[DEBUG] ❌ Base64 fallback also failed for:', file.name, base64Error);
            // Re-throw the original error, not the base64 error
            throw fileError;
          }
        } else {
          // File too large - re-throw the error
          throw fileError;
        }
      }
    }

    console.log('[DEBUG] uploadVideos complete', { uploadedCount: uploadedUrls.length, totalFiles: files.length });
    if (uploadedUrls.length === 0 && files.length > 0) {
      console.warn('[DEBUG] ⚠️ WARNING: No videos were uploaded successfully!');
    }
    return uploadedUrls;
  };

  // Add property
  const addProperty = async (propertyData: Partial<Property>): Promise<Property | null> => {
    if (!supabase) {
      setError('Supabase client not initialized');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await (supabase as SupabaseClient).auth.getUser();
      if (!user) throw new Error('Must be logged in to add a property');

      const dbData = propertyToDbRow(propertyData);
      dbData.agent_id = user.id;

      // Remove any undefined fields and ensure country_code is not included (column doesn't exist)
      Object.keys(dbData).forEach(key => {
        if (dbData[key] === undefined || key === 'country_code') {
          delete dbData[key];
        }
      });

      // Retry logic for schema cache refresh (PostgREST may need a moment after migration)
      let insertError: any = null;
      let data: any = null;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await (supabase as SupabaseClient).from('properties').insert(dbData).select().single();
        insertError = result.error;
        data = result.data;

        if (!insertError) {
          break; // Success, exit retry loop
        }

        // If error is about schema cache and we have retries left, wait and retry
        if (insertError?.code === 'PGRST204' && insertError?.message?.includes('schema cache') && attempt < maxRetries - 1) {
          console.warn(`[DEBUG] Schema cache not refreshed yet, retrying insert in ${retryDelay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1))); // Exponential backoff
          continue;
        }

        // For other errors or last attempt, break and throw
        break;
      }

      if (insertError) throw insertError;

      const newProperty = dbRowToProperty(data);
      setProperties(prev => [newProperty, ...prev]);
      return newProperty;
    } catch (err: any) {
      console.error('Error adding property:', err);
      setError(err.message || 'Failed to add property');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update property
  const updateProperty = async (id: string, propertyData: Partial<Property>): Promise<Property | null> => {
    if (!supabase) {
      const errorMsg = 'Supabase client not initialized';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);

    try {
      const dbData = propertyToDbRow(propertyData);
      dbData.updated_at = new Date().toISOString();

      // Remove any undefined fields and ensure country_code is not included (column doesn't exist)
      Object.keys(dbData).forEach(key => {
        if (dbData[key] === undefined || key === 'country_code') {
          delete dbData[key];
        }
      });

      // Ensure required fields are present (use defaults if not provided)
      if (!dbData.hasOwnProperty('status') || dbData.status === null || dbData.status === undefined || dbData.status === '') {
        dbData.status = propertyData.status || 'online';
      }

      if (!dbData.hasOwnProperty('listing_type') || dbData.listing_type === null || dbData.listing_type === undefined || dbData.listing_type === '') {
        dbData.listing_type = propertyData.listingType || 'sale';
      }

      // Ensure numeric required fields are set
      if (dbData.bedrooms === null || dbData.bedrooms === undefined || isNaN(dbData.bedrooms)) {
        dbData.bedrooms = propertyData.bedrooms ?? propertyData.rooms?.bedrooms ?? 0;
      }
      if (dbData.bathrooms === null || dbData.bathrooms === undefined || isNaN(dbData.bathrooms)) {
        dbData.bathrooms = propertyData.bathrooms ?? propertyData.rooms?.bathrooms ?? 0;
      }
      if (dbData.price === null || dbData.price === undefined || isNaN(Number(dbData.price)) || Number(dbData.price) < 0) {
        dbData.price = propertyData.price?.amount ?? 0;
      }
      if (!dbData.title || typeof dbData.title !== 'string' || dbData.title.trim() === '') {
        throw new Error('Property title is required');
      }

      // Retry logic for schema cache refresh (PostgREST may need a moment after migration)
      let updateError: any = null;
      let data: any = null;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await (supabase as SupabaseClient)
          .from('properties')
          .update(dbData)
          .eq('id', id)
          .select()
          .single();

        updateError = result.error;
        data = result.data;

        if (!updateError) {
          break; // Success, exit retry loop
        }

        // If error is about schema cache and we have retries left, wait and retry
        if (updateError?.code === 'PGRST204' && updateError?.message?.includes('schema cache') && attempt < maxRetries - 1) {
          console.warn(`[DEBUG] Schema cache not refreshed yet, retrying in ${retryDelay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1))); // Exponential backoff
          continue;
        }

        // For other errors or last attempt, break and throw
        break;
      }

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }
      if (!data) {
        console.error('Update returned no data for property:', id);
        throw new Error('Property not found or update failed - no data returned');
      }

      const updatedProperty = dbRowToProperty(data);
      setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
      return updatedProperty;
    } catch (err: any) {
      console.error('Error updating property:', err);
      let errorMsg = 'Failed to update property';

      // Extract meaningful error message
      if (err?.message) {
        errorMsg = err.message;
      } else if (err?.code) {
        errorMsg = `Database error: ${err.code} - ${err.message || err.details || 'Unknown error'}`;
      } else if (typeof err === 'string') {
        errorMsg = err;
      } else if (err?.details) {
        errorMsg = err.details;
      }

      setError(errorMsg);
      // Create a new error with the formatted message to ensure it's properly thrown
      const errorToThrow = new Error(errorMsg);
      (errorToThrow as any).cause = err;
      throw errorToThrow;
    } finally {
      setLoading(false);
    }
  };

  // Delete property
  const deleteProperty = async (id: string) => {
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }

    try {
      const { error } = await (supabase as SupabaseClient).from('properties').delete().eq('id', id);
      if (error) throw error;
      setProperties(prev => prev.filter(p => p.id !== id));
      setSelectedProperties(prev => prev.filter(pid => pid !== id));
    } catch (err: any) {
      console.error('Error deleting property:', err);
      setError(err.message || 'Failed to delete property');
    }
  };

  // Delete multiple
  const deleteProperties = async (ids: string[]) => {
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }

    try {
      const { error } = await (supabase as SupabaseClient).from('properties').delete().in('id', ids);
      if (error) throw error;
      setProperties(prev => prev.filter(p => !ids.includes(p.id)));
      setSelectedProperties(prev => prev.filter(pid => !ids.includes(pid)));
    } catch (err: any) {
      console.error('Error deleting properties:', err);
      setError(err.message || 'Failed to delete properties');
    }
  };

  // Duplicate property
  const duplicateProperty = async (id: string): Promise<Property | null> => {
    const original = properties.find(p => p.id === id);
    if (!original) return null;

    const duplicateData: Partial<Property> = {
      ...original,
      title: `${original.title} (Copy)`,
      published: false,
      draft: true,
      analytics: { views: 0, inquiries: 0, favorites: 0, shares: 0 },
    };
    delete (duplicateData as any).id;
    delete (duplicateData as any).createdAt;
    delete (duplicateData as any).updatedAt;

    return await addProperty(duplicateData);
  };

  // Get property
  const getProperty = (id: string) => properties.find(p => p.id === id);

  // Selection
  const selectProperty = (id: string) => setSelectedProperties(prev => prev.includes(id) ? prev : [...prev, id]);
  const deselectProperty = (id: string) => setSelectedProperties(prev => prev.filter(pid => pid !== id));
  const selectAllProperties = () => setSelectedProperties(paginatedProperties.map(p => p.id));
  const clearSelection = () => setSelectedProperties([]);

  // Bulk status update
  const bulkUpdateStatus = async (ids: string[], status: PropertyStatus) => {
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }

    try {
      const { error } = await (supabase as SupabaseClient).from('properties').update({ status, updated_at: new Date().toISOString() }).in('id', ids);
      if (error) throw error;
      setProperties(prev => prev.map(p => ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p));
    } catch (err: any) {
      console.error('Error updating statuses:', err);
      setError(err.message || 'Failed to update statuses');
    }
  };

  const setFilters = (newFilters: PropertyFilters) => {
    setFiltersState(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFiltersState({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const setPage = (page: number) => setPagination(prev => ({ ...prev, page }));
  const setLimit = (limit: number) => setPagination(prev => ({ ...prev, limit, page: 1 }));

  const incrementViews = async (id: string) => {
    if (!supabase) return;

    const p = properties.find(prop => prop.id === id);
    if (!p) return;
    try {
      await (supabase as SupabaseClient).from('properties').update({ views: (p.analytics?.views || 0) + 1 }).eq('id', id);
      setProperties(prev => prev.map(prop => prop.id === id ? { ...prop, analytics: { ...prop.analytics, views: (prop.analytics?.views || 0) + 1 } } : prop));
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const incrementInquiries = async (id: string) => {
    if (!supabase) return;

    const p = properties.find(prop => prop.id === id);
    if (!p) return;
    try {
      await (supabase as SupabaseClient).from('properties').update({ inquiries: (p.analytics?.inquiries || 0) + 1 }).eq('id', id);
      setProperties(prev => prev.map(prop => prop.id === id ? { ...prop, analytics: { ...prop.analytics, inquiries: (prop.analytics?.inquiries || 0) + 1 } } : prop));
    } catch (err) {
      console.error('Error incrementing inquiries:', err);
    }
  };

  const incrementShares = async (id: string) => {
    if (!supabase) return;

    const p = properties.find(prop => prop.id === id);
    if (!p) return;
    try {
      await (supabase as SupabaseClient).from('properties').update({ shares: (p.analytics?.shares || 0) + 1 }).eq('id', id);
      setProperties(prev => prev.map(prop => prop.id === id ? { ...prop, analytics: { ...prop.analytics, shares: (prop.analytics?.shares || 0) + 1 } } : prop));
    } catch (err) {
      console.error('Error incrementing shares:', err);
    }
  };

  const exportProperties = (format: 'csv' | 'json' | 'pdf', ids?: string[]) => {
    // If specific IDs are provided, export those (respecting current sort)
    // Otherwise, export ALL filtered and sorted properties (not just current page)
    const toExport = ids
      ? sortedAndFiltered.filter(p => ids.includes(p.id))
      : sortedAndFiltered;

    if (format === 'json') {
      const dataStr = JSON.stringify(toExport, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'properties.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['ID', 'Title', 'Type', 'Status', 'Price', 'Bedrooms', 'Bathrooms', 'City'];
      const rows = toExport.map(p => [p.id, `"${p.title}"`, p.propertyType, p.status, p.price?.amount || 0, p.bedrooms || 0, p.bathrooms || 0, p.city || '']);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'properties.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formatPrice = (price: PriceInfo): string => {
    const formatter = currencyFormatters[price.currency] || currencyFormatters.USD;
    return formatter.format(price.amount);
  };

  const formatArea = (area: number, unit: AreaUnit): string => {
    const formatted = new Intl.NumberFormat().format(area);
    const unitLabels: Record<AreaUnit, string> = { sqft: 'sq ft', sqm: 'sq m', acres: 'acres', hectares: 'ha' };
    return `${formatted} ${unitLabels[unit]}`;
  };

  const getPropertyStats = () => ({
    total: properties.length,
    available: properties.filter(p => p.status === 'online' || p.status === 'active').length,
    sold: properties.filter(p => p.status === 'sold').length,
    rented: properties.filter(p => p.status === 'let').length,
    pending: properties.filter(p => p.status === 'under_offer').length,
  });

  return (
    <PropertyContext.Provider
      value={{
        properties,
        filteredProperties: paginatedProperties,
        selectedProperties,
        filters,
        sort,
        pagination,
        loading,
        error,
        fetchProperties,
        addProperty,
        updateProperty,
        deleteProperty,
        deleteProperties,
        duplicateProperty,
        getProperty,
        uploadImages,
        uploadVideos,
        selectProperty,
        deselectProperty,
        selectAllProperties,
        clearSelection,
        bulkUpdateStatus,
        setFilters,
        clearFilters,
        setSort,
        setPage,
        setLimit,
        incrementViews,
        incrementInquiries,
        incrementShares,
        exportProperties,
        formatPrice,
        formatArea,
        getPropertyStats,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export default PropertyContext;

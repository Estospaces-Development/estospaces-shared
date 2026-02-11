/**
 * Mock Data Service
 * Provides mock data for all dashboard features without Supabase API calls
 *
 * UPDATED: Uses dynamic dates via date-fns to ensure the demo always looks "live"
 */

import { subDays, subHours, subMinutes, addDays, format } from 'date-fns';

const NOW = new Date();

// ============================================================================
// MOCK PROPERTIES - For Buy/Rent tabs
// ============================================================================

export const MOCK_PROPERTIES = [
    {
        id: 'prop-001',
        title: 'Immaculate Victorian Townhouse',
        address_line_1: '42 Kensington Gardens',
        city: 'London',
        postcode: 'W8 4PX',
        price: 3250000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 5,
        bathrooms: 4,
        area: 3200,
        description: 'A magnificent Victorian townhouse featuring original period details, a private garden, and modern amenities throughout. Recently renovated to the highest standard.',
        image_urls: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop', // Premium White Exterior
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop', // Modern Interior
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop'  // Kitchen
        ],
        latitude: 51.5074,
        longitude: -0.1878,
        view_count: 856,
        created_at: subDays(NOW, 2).toISOString(),
        features: ['Private Garden', 'Wine Cellar', 'Period Features', 'Smart Home System'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 51.5074,
        street_view_lng: -0.1878,
        has_virtual_tour: true,
        status: 'available',
        agent_name: 'Sarah Mitchell',
        agent_company: 'Kensington & Co'
    },
    {
        id: 'prop-002',
        title: 'Ultra-Modern River View Penthouse',
        address_line_1: '15 Canary Wharf Tower',
        city: 'London',
        postcode: 'E14 5AB',
        price: 850000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 2,
        bathrooms: 2,
        area: 1150,
        description: 'Luxurious apartment with stunning river views, 24/7 concierge, gym access, and underground parking. Perfect for city professionals.',
        image_urls: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop', // Modern High-rise Apartment
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2000&auto=format&fit=crop', // Minimalist Interior
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2000&auto=format&fit=crop'  // Living Room
        ],
        latitude: 51.5054,
        longitude: -0.0235,
        view_count: 1250,
        created_at: subHours(NOW, 4).toISOString(),
        features: ['River Views', '24/7 Concierge', 'Residents Gym', 'Underground Parking'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 51.5054,
        street_view_lng: -0.0235,
        has_virtual_tour: true,
        status: 'pending',
        agent_name: 'James Wilson',
        agent_company: 'Canary Wharf Estates'
    },
    {
        id: 'prop-003',
        title: 'Stunning Cotswold Stone Cottage',
        address_line_1: '7 Rose Lane',
        city: 'Cotswolds',
        postcode: 'GL54 2HN',
        price: 685000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
        description: 'Beautiful stone cottage in the heart of the Cotswolds with exposed beams, inglenook fireplace, and landscaped gardens.',
        image_urls: [
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2000&auto=format&fit=crop', // Cottage Exterior
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2000&auto=format&fit=crop', // Cozy Interior
            'https://images.unsplash.com/photo-1572120366674-06853cb5b325?q=80&w=2000&auto=format&fit=crop'  // Fireplace
        ],
        latitude: 51.8330,
        longitude: -1.8433,
        view_count: 542,
        created_at: subDays(NOW, 5).toISOString(),
        features: ['Landscaped Garden', 'Inglenook Fireplace', 'Exposed Beams', 'Garage'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=Zh14WDtkjdB',
        street_view_lat: 51.8330,
        street_view_lng: -1.8433,
        has_virtual_tour: true,
        status: 'available',
        agent_name: 'Eleanor Rigby',
        agent_company: 'Country Living'
    },
    {
        id: 'prop-004',
        title: 'Architect-Designed City Loft',
        address_line_1: '88 Manchester Central',
        city: 'Manchester',
        postcode: 'M1 5GN',
        price: 2500,
        property_type: 'rent',
        listing_type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        area: 850,
        description: 'Stylish studio flat with floor-to-ceiling windows, built-in appliances, and access to rooftop terrace. Bills included.',
        image_urls: [
            'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=2000&auto=format&fit=crop', // Loft Interior
            'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2000&auto=format&fit=crop'  // Bedroom
        ],
        latitude: 53.4808,
        longitude: -2.2426,
        view_count: 310,
        created_at: subDays(NOW, 1).toISOString(),
        features: ['All Bills Included', 'Rooftop Terrace', 'Designer Furnishings', 'High Speed Wifi'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 53.4808,
        street_view_lng: -2.2426,
        has_virtual_tour: true,
        status: 'available',
        agent_name: 'Marcus Rashford',
        agent_company: 'City Lofts'
    },
    {
        id: 'prop-005',
        title: 'Executive Family Home',
        address_line_1: '24 Oak Avenue',
        city: 'Birmingham',
        postcode: 'B15 2TT',
        price: 2200,
        property_type: 'rent',
        listing_type: 'rent',
        bedrooms: 4,
        bathrooms: 3,
        area: 2100,
        description: 'Perfect family home with large garden, driveway parking, and close to excellent schools. Pet-friendly.',
        image_urls: [
            'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=2000&auto=format&fit=crop', // Family Home Exterior
            'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?q=80&w=2000&auto=format&fit=crop'  // Living Room
        ],
        latitude: 52.4862,
        longitude: -1.8904,
        view_count: 189,
        created_at: subDays(NOW, 3).toISOString(),
        features: ['Double Garage', 'Large Garden', 'Pet Friendly', 'Top Schools Nearby'],
        virtual_tour_url: null,
        street_view_lat: 52.4862,
        street_view_lng: -1.8904,
        has_virtual_tour: false,
        status: 'rented',
        agent_name: 'Tommy Shelby',
        agent_company: 'Small Heath Realty'
    },
    {
        id: 'prop-006',
        title: 'The Shard - Luxury Residence',
        address_line_1: '32 London Bridge St',
        city: 'London',
        postcode: 'SE1 9SG',
        price: 5500000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 3,
        area: 2500,
        description: 'Exclusive residence with 360-degree views of London, private telescope, wine cellar, and smart home technology.',
        image_urls: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop', // Luxury Windows
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop'  // Luxury Bath
        ],
        latitude: 51.5055,
        longitude: -0.0754,
        view_count: 2450,
        created_at: subDays(NOW, 7).toISOString(),
        features: ['Panoramic Views', 'Private Elevator', 'Wine Cellar', 'Concierge Service'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 51.5055,
        street_view_lng: -0.0754,
        has_virtual_tour: true,
        status: 'available',
        agent_name: 'Victoria Beckham',
        agent_company: 'Posh Properties'
    }
];

// ============================================================================
// MOCK INTERNATIONAL PROPERTIES - For Overseas Tab (Worldwide)
// ============================================================================

export const MOCK_OVERSEAS_PROPERTIES = [
    // SPAIN - Marbella
    {
        id: 'prop-int-esp-001',
        title: 'Modern Villa with Sea Views',
        address_line_1: 'Calle de la Costa',
        city: 'Marbella',
        country: 'Spain',
        country_code: 'ES',
        postcode: '29600',
        price: 1250000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 2800,
        description: 'Stunning modern villa with infinity pool and panoramic views of the Mediterranean.',
        image_urls: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2000&auto=format&fit=crop', // Modern White Villa
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop'  // Modern Interior
        ],
        latitude: 36.5104,
        longitude: -4.8826,
        view_count: 567,
        created_at: '2024-01-15T09:00:00Z',
        features: ['Infinity Pool', 'Sea Views', 'Smart Home'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 36.5104,
        street_view_lng: -4.8826,
        has_virtual_tour: true,
        agent: {
            name: 'Carlos Rodriguez',
            phone: '+34 952 123 456',
            email: 'carlos@marbellaluxury.es',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            languages: ['English', 'Spanish']
        }
    },
    // FRANCE - Paris
    {
        id: 'prop-int-fra-001',
        title: 'Elegant Parisian Apartment',
        address_line_1: 'Avenue des Champs-Élysées',
        city: 'Paris',
        country: 'France',
        country_code: 'FR',
        postcode: '75008',
        price: 2100000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
        description: 'Magnificent Haussmann-style apartment with Eiffel Tower views, ornate moldings, and herringbone parquet floors.',
        image_urls: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop', // Elegant Apartment Living
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop'  // Kitchen
        ],
        latitude: 48.8698,
        longitude: 2.3075,
        view_count: 1234,
        created_at: '2024-01-12T09:00:00Z',
        features: ['Eiffel Tower Views', 'Balcony', 'Period Features', 'Cellar'],
        virtual_tour_url: null,
        street_view_lat: 48.8698,
        street_view_lng: 2.3075,
        has_virtual_tour: false,
        agent: {
            name: 'Sophie Dubois',
            phone: '+33 1 42 68 53 00',
            email: 'sophie@parisimmobilier.fr',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            languages: ['English', 'French', 'German']
        }
    },
    // PORTUGAL - Lisbon
    {
        id: 'prop-int-prt-001',
        title: 'Renovated Townhouse in Alfama',
        address_line_1: 'Rua da Saudade',
        city: 'Lisbon',
        country: 'Portugal',
        country_code: 'PT',
        postcode: '1100-001',
        price: 890000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 2200,
        description: 'Beautifully restored townhouse in historic Alfama with rooftop terrace overlooking the Tagus River.',
        image_urls: [
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2000&auto=format&fit=crop', // Beautiful Townhouse
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2000&auto=format&fit=crop'  // Modern Interior
        ],
        latitude: 38.7139,
        longitude: -9.1334,
        view_count: 789,
        created_at: '2024-01-10T09:00:00Z',
        features: ['River Views', 'Rooftop Terrace', 'Historic District', 'Renovated'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 38.7139,
        street_view_lng: -9.1334,
        has_virtual_tour: true,
        agent: {
            name: 'João Santos',
            phone: '+351 21 123 4567',
            email: 'joao@lisbonhomes.pt',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            languages: ['English', 'Portuguese', 'Spanish']
        }
    },
    // ITALY - Rome
    {
        id: 'prop-int-ita-001',
        title: 'Luxury Apartment near Colosseum',
        address_line_1: 'Via dei Fori Imperiali',
        city: 'Rome',
        country: 'Italy',
        country_code: 'IT',
        postcode: '00184',
        price: 1450000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 1600,
        description: 'An elegant apartment with direct views of the Colosseum. Features distinctive Italian design, high ceilings, and a spacious terrace.',
        image_urls: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop', // Luxury Apartment Exterior
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2000&auto=format&fit=crop'  // Minimalist Interior
        ],
        latitude: 41.8902,
        longitude: 12.4922,
        view_count: 2314,
        created_at: '2024-01-20T09:00:00Z',
        features: ['Colosseum Views', 'Terrace', 'Historic Building', 'Concierge'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 41.8902,
        street_view_lng: 12.4922,
        has_virtual_tour: true,
        agent: {
            name: 'Marco Rossi',
            phone: '+39 06 123 4567',
            email: 'marco@romeprestige.it',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            languages: ['English', 'Italian', 'French']
        }
    },
    // GREECE - Santorini
    {
        id: 'prop-int-grc-001',
        title: 'Cliffside Villa in Oia',
        address_line_1: 'Oia Village',
        city: 'Santorini',
        country: 'Greece',
        country_code: 'GR',
        postcode: '84702',
        price: 1850000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 2400,
        description: 'Iconic white-washed villa with blue dome, infinity pool, and breathtaking caldera sunset views.',
        image_urls: [
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2000&auto=format&fit=crop', // White Mediterranean Villa
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000&auto=format&fit=crop'  // Bright Interior
        ],
        latitude: 36.4618,
        longitude: 25.3753,
        view_count: 3456,
        created_at: '2024-01-08T09:00:00Z',
        features: ['Caldera Views', 'Infinity Pool', 'Private Terrace', 'Cave Rooms'],
        virtual_tour_url: null,
        street_view_lat: 36.4618,
        street_view_lng: 25.3753,
        has_virtual_tour: false,
        agent: {
            name: 'Elena Papadopoulos',
            phone: '+30 22860 71234',
            email: 'elena@santoriniproperties.gr',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
            languages: ['English', 'Greek', 'German']
        }
    },
    // UAE - Dubai
    {
        id: 'prop-int-uae-001',
        title: 'Penthouse at Palm Jumeirah',
        address_line_1: 'Palm Jumeirah',
        city: 'Dubai',
        country: 'United Arab Emirates',
        country_code: 'AE',
        postcode: '',
        price: 8500000,
        currency: 'USD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 5,
        bathrooms: 6,
        area: 8500,
        description: 'Ultra-luxury penthouse with private beach access, rooftop pool, and panoramic views of Dubai Marina and Burj Al Arab.',
        image_urls: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2000&auto=format&fit=crop', // Ultra-Modern Mansion
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2000&auto=format&fit=crop'  // Luxury Interior
        ],
        latitude: 25.1124,
        longitude: 55.1390,
        view_count: 4567,
        created_at: '2024-01-05T09:00:00Z',
        features: ['Private Beach', 'Rooftop Pool', 'Burj Al Arab Views', 'Smart Home'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 25.1124,
        street_view_lng: 55.1390,
        has_virtual_tour: true,
        agent: {
            name: 'Ahmed Al Maktoum',
            phone: '+971 4 123 4567',
            email: 'ahmed@dubailuxuryestates.ae',
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100',
            languages: ['English', 'Arabic', 'Hindi']
        }
    },
    // THAILAND - Phuket
    {
        id: 'prop-int-tha-001',
        title: 'Beachfront Villa in Phuket',
        address_line_1: 'Kamala Beach',
        city: 'Phuket',
        country: 'Thailand',
        country_code: 'TH',
        postcode: '83150',
        price: 2200000,
        currency: 'USD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 6,
        bathrooms: 7,
        area: 6000,
        description: 'Stunning beachfront villa with private infinity pool, tropical gardens, and direct beach access on Kamala Beach.',
        image_urls: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop', // Tropical Villa
            'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2000&auto=format&fit=crop'  // Resort Interior
        ],
        latitude: 7.9519,
        longitude: 98.2817,
        view_count: 1890,
        created_at: '2024-01-03T09:00:00Z',
        features: ['Beachfront', 'Infinity Pool', 'Tropical Garden', 'Staff Quarters'],
        virtual_tour_url: null,
        street_view_lat: 7.9519,
        street_view_lng: 98.2817,
        has_virtual_tour: false,
        agent: {
            name: 'Nattaya Wongchai',
            phone: '+66 76 123 456',
            email: 'nattaya@phuketluxury.th',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
            languages: ['English', 'Thai', 'Mandarin']
        }
    },
    // JAPAN - Tokyo
    {
        id: 'prop-int-jpn-001',
        title: 'Modern Penthouse in Shibuya',
        address_line_1: 'Shibuya Crossing',
        city: 'Tokyo',
        country: 'Japan',
        country_code: 'JP',
        postcode: '150-0002',
        price: 3800000,
        currency: 'USD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 2200,
        description: 'Sleek contemporary penthouse overlooking famous Shibuya Crossing, featuring traditional Japanese design elements and smart home technology.',
        image_urls: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop', // Modern High-rise
            'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?q=80&w=2000&auto=format&fit=crop'  // Contemporary Interior
        ],
        latitude: 35.6595,
        longitude: 139.7004,
        view_count: 2345,
        created_at: '2024-01-01T09:00:00Z',
        features: ['City Views', 'Zen Garden', 'Smart Home', 'Concierge'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 35.6595,
        street_view_lng: 139.7004,
        has_virtual_tour: true,
        agent: {
            name: 'Yuki Tanaka',
            phone: '+81 3 1234 5678',
            email: 'yuki@tokyopremium.jp',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
            languages: ['English', 'Japanese', 'Mandarin']
        }
    },
    // AUSTRALIA - Sydney
    {
        id: 'prop-int-aus-001',
        title: 'Harbour View Apartment',
        address_line_1: 'Circular Quay',
        city: 'Sydney',
        country: 'Australia',
        country_code: 'AU',
        postcode: '2000',
        price: 4200000,
        currency: 'AUD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 3000,
        description: 'Prestigious apartment with unobstructed views of Sydney Harbour, Opera House, and Harbour Bridge.',
        image_urls: [
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=2000&auto=format&fit=crop', // Waterfront Home
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2000&auto=format&fit=crop'  // Luxury Interior
        ],
        latitude: -33.8568,
        longitude: 151.2153,
        view_count: 1567,
        created_at: '2023-12-28T09:00:00Z',
        features: ['Opera House Views', 'Harbour Views', 'Concierge', 'Pool'],
        virtual_tour_url: null,
        street_view_lat: -33.8568,
        street_view_lng: 151.2153,
        has_virtual_tour: false,
        agent: {
            name: 'James Mitchell',
            phone: '+61 2 9876 5432',
            email: 'james@sydneyprestige.com.au',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            languages: ['English', 'Mandarin']
        }
    },
    // USA - Miami
    {
        id: 'prop-int-usa-001',
        title: 'Oceanfront Condo in Miami Beach',
        address_line_1: 'Collins Avenue',
        city: 'Miami',
        country: 'United States',
        country_code: 'US',
        postcode: '33139',
        price: 3500000,
        currency: 'USD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 3,
        area: 2800,
        description: 'Luxurious oceanfront condo with floor-to-ceiling windows, private balcony, and full resort amenities.',
        image_urls: [
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2000&auto=format&fit=crop', // Oceanfront Modern Home
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop'  // Modern Interior
        ],
        latitude: 25.7907,
        longitude: -80.1300,
        view_count: 2890,
        created_at: '2023-12-25T09:00:00Z',
        features: ['Oceanfront', 'Pool', 'Spa', 'Concierge'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 25.7907,
        street_view_lng: -80.1300,
        has_virtual_tour: true,
        agent: {
            name: 'Maria Rodriguez',
            phone: '+1 305 123 4567',
            email: 'maria@miamiluxuryrealty.com',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
            languages: ['English', 'Spanish', 'Portuguese']
        }
    },
    // CANADA - Vancouver
    {
        id: 'prop-int-can-001',
        title: 'Waterfront Penthouse',
        address_line_1: 'Coal Harbour',
        city: 'Vancouver',
        country: 'Canada',
        country_code: 'CA',
        postcode: 'V6C 3L2',
        price: 5800000,
        currency: 'CAD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 4,
        area: 4200,
        description: 'Spectacular penthouse with mountain and ocean views, private rooftop terrace, and world-class finishes.',
        image_urls: [
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop', // Modern Luxury Kitchen
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop'  // Elegant Interior
        ],
        latitude: 49.2889,
        longitude: -123.1178,
        view_count: 987,
        created_at: '2023-12-20T09:00:00Z',
        features: ['Mountain Views', 'Ocean Views', 'Rooftop Terrace', 'Wine Room'],
        virtual_tour_url: null,
        street_view_lat: 49.2889,
        street_view_lng: -123.1178,
        has_virtual_tour: false,
        agent: {
            name: 'Michael Chen',
            phone: '+1 604 987 6543',
            email: 'michael@vancouverluxury.ca',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            languages: ['English', 'Mandarin', 'Cantonese']
        }
    },
    // MEXICO - Cancun
    {
        id: 'prop-int-mex-001',
        title: 'Beachfront Villa in Hotel Zone',
        address_line_1: 'Boulevard Kukulcan',
        city: 'Cancun',
        country: 'Mexico',
        country_code: 'MX',
        postcode: '77500',
        price: 1650000,
        currency: 'USD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 5,
        bathrooms: 5,
        area: 5500,
        description: 'Stunning beachfront villa with Caribbean Sea views, private pool, and Mayan-inspired architecture.',
        image_urls: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2000&auto=format&fit=crop', // Luxury Beach Villa
            'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2000&auto=format&fit=crop'  // Resort Style Interior
        ],
        latitude: 21.1393,
        longitude: -86.8499,
        view_count: 1234,
        created_at: '2023-12-18T09:00:00Z',
        features: ['Beachfront', 'Private Pool', 'Ocean Views', 'Gated Community'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 21.1393,
        street_view_lng: -86.8499,
        has_virtual_tour: true,
        agent: {
            name: 'Diego Hernandez',
            phone: '+52 998 123 4567',
            email: 'diego@cancunluxury.mx',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            languages: ['English', 'Spanish']
        }
    },
    // SWITZERLAND - Zurich
    {
        id: 'prop-int-che-001',
        title: 'Lakefront Chalet',
        address_line_1: 'Seestrasse',
        city: 'Zurich',
        country: 'Switzerland',
        country_code: 'CH',
        postcode: '8002',
        price: 6500000,
        currency: 'CHF',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 5,
        bathrooms: 4,
        area: 4800,
        description: 'Exquisite lakefront property with Alpine views, private dock, and authentic Swiss chalet design.',
        image_urls: [
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2000&auto=format&fit=crop', // Cottage Exterior
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop'  // Cozy Interior
        ],
        latitude: 47.3494,
        longitude: 8.5413,
        view_count: 654,
        created_at: '2023-12-15T09:00:00Z',
        features: ['Lake Views', 'Alpine Views', 'Private Dock', 'Wine Cellar'],
        virtual_tour_url: null,
        street_view_lat: 47.3494,
        street_view_lng: 8.5413,
        has_virtual_tour: false,
        agent: {
            name: 'Hans Mueller',
            phone: '+41 44 123 4567',
            email: 'hans@zurichluxury.ch',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            languages: ['English', 'German', 'French', 'Italian']
        }
    },
    // GERMANY - Berlin
    {
        id: 'prop-int-deu-001',
        title: 'Historic Penthouse in Mitte',
        address_line_1: 'Unter den Linden',
        city: 'Berlin',
        country: 'Germany',
        country_code: 'DE',
        postcode: '10117',
        price: 2900000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 3200,
        description: 'Stunning penthouse in historic building with Brandenburg Gate views, rooftop terrace, and luxury finishes.',
        image_urls: [
            'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?q=80&w=2000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop'
        ],
        latitude: 52.5170,
        longitude: 13.3888,
        view_count: 876,
        created_at: '2023-12-12T09:00:00Z',
        features: ['City Views', 'Rooftop Terrace', 'Historic Building', 'Concierge'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 52.5170,
        street_view_lng: 13.3888,
        has_virtual_tour: true,
        agent: {
            name: 'Anna Schmidt',
            phone: '+49 30 123 4567',
            email: 'anna@berlinpremium.de',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
            languages: ['English', 'German', 'Polish']
        }
    }
];


// ============================================================================
// MOCK APPLICATIONS
// ============================================================================

export const MOCK_APPLICATIONS = [
    {
        id: 'app-001',
        property_id: 'prop-002',
        property: MOCK_PROPERTIES[1],
        status: 'in_progress',
        current_stage: 'Document Verification',
        progress: 40,
        created_at: subDays(NOW, 2).toISOString(),
        updated_at: subHours(NOW, 2).toISOString(),
        timeline: [
            { stage: 'Application Submitted', date: format(subDays(NOW, 2), 'yyyy-MM-dd'), status: 'completed' },
            { stage: 'Document Verification', date: format(NOW, 'yyyy-MM-dd'), status: 'current' },
            { stage: 'Property Inspection', date: null, status: 'pending' },
            { stage: 'Final Approval', date: null, status: 'pending' }
        ]
    },
    {
        id: 'app-002',
        property_id: 'prop-004',
        property: MOCK_PROPERTIES[3],
        status: 'approved',
        current_stage: 'Viewing Scheduled',
        progress: 75,
        created_at: subDays(NOW, 5).toISOString(),
        updated_at: subDays(NOW, 1).toISOString(),
        timeline: [
            { stage: 'Application Submitted', date: format(subDays(NOW, 5), 'yyyy-MM-dd'), status: 'completed' },
            { stage: 'Reference Check', date: format(subDays(NOW, 4), 'yyyy-MM-dd'), status: 'completed' },
            { stage: 'Viewing Scheduled', date: format(subDays(NOW, 1), 'yyyy-MM-dd'), status: 'current' },
            { stage: 'Contract Signing', date: null, status: 'pending' }
        ]
    }
];

// ============================================================================
// MOCK VIEWINGS
// ============================================================================

export const MOCK_VIEWINGS = [
    {
        id: 'view-001',
        property_id: 'prop-002',
        property: MOCK_PROPERTIES[1],
        scheduled_date: format(addDays(NOW, 2), 'yyyy-MM-dd'),
        scheduled_time: '10:00',
        status: 'confirmed',
        agent: {
            name: 'Sarah Mitchell',
            phone: '+44 7700 900123',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
        },
        notes: 'Please arrive 5 minutes early. Parking available in the building.'
    },
    {
        id: 'view-002',
        property_id: 'prop-003',
        property: MOCK_PROPERTIES[2],
        scheduled_date: format(addDays(NOW, 5), 'yyyy-MM-dd'),
        scheduled_time: '14:30',
        status: 'pending',
        agent: {
            name: 'James Wilson',
            phone: '+44 7700 900456',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'
        },
        notes: 'Virtual viewing also available upon request.'
    },
    {
        id: 'view-003',
        property_id: 'prop-006',
        property: MOCK_PROPERTIES[5],
        scheduled_date: format(subDays(NOW, 3), 'yyyy-MM-dd'),
        scheduled_time: '11:00',
        status: 'completed',
        agent: {
            name: 'Emma Thompson',
            phone: '+44 7700 900789',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100'
        },
        notes: 'Viewing completed. Follow-up call scheduled.'
    }
];

// ============================================================================
// MOCK SAVED PROPERTIES
// ============================================================================

export const MOCK_SAVED_PROPERTIES = [
    MOCK_PROPERTIES[0],
    MOCK_PROPERTIES[2],
    MOCK_PROPERTIES[5],
    MOCK_PROPERTIES[6]
];

// ============================================================================
// MOCK USER PROFILE
// ============================================================================

export const MOCK_USER_PROFILE = {
    id: 'user-001',
    email: 'alex.mercer@example.com',
    full_name: 'Alex Mercer',
    phone: '+44 7700 123456',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    address: '123 High Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    preferred_locations: ['London', 'Manchester', 'Birmingham'],
    property_preferences: {
        min_bedrooms: 2,
        max_budget: 500000,
        property_types: ['Apartment', 'House']
    },
    notifications: {
        email: true,
        sms: false,
        push: true
    },
    created_at: subDays(NOW, 30).toISOString()
};

// ============================================================================
// MOCK MESSAGES
// ============================================================================

export const MOCK_MESSAGES = [
    {
        id: 'msg-001',
        sender: {
            name: 'Sarah Mitchell',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
            role: 'agent'
        },
        property_id: 'prop-002',
        property_title: 'Modern 2-Bedroom Apartment',
        preview: 'Thank you for your interest in the property. I would love to arrange a viewing at your convenience.',
        timestamp: subHours(NOW, 2).toISOString(),
        unread: true
    },
    {
        id: 'msg-002',
        sender: {
            name: 'Estospaces Support',
            avatar: null,
            role: 'support'
        },
        property_id: null,
        property_title: null,
        preview: 'Your application for 42 Kensington Gardens has been received. We will review and respond within 24 hours.',
        timestamp: subDays(NOW, 2).toISOString(),
        unread: false
    },
    {
        id: 'msg-003',
        sender: {
            name: 'James Wilson',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            role: 'agent'
        },
        property_id: 'prop-003',
        property_title: 'Charming 3-Bedroom Cottage',
        preview: 'The seller has accepted your offer! Congratulations! Let\'s discuss the next steps.',
        timestamp: subDays(NOW, 5).toISOString(),
        unread: false
    }
];

// ============================================================================
// MOCK PAYMENTS
// ============================================================================

export const MOCK_PAYMENTS = [
    {
        id: 'pay-001',
        type: 'deposit',
        amount: 3000,
        status: 'completed',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: subDays(NOW, 15).toISOString(),
        reference: 'DEP-2024-001'
    },
    {
        id: 'pay-002',
        type: 'rent',
        amount: 1500,
        status: 'pending',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: addDays(NOW, 5).toISOString(),
        reference: 'RENT-2024-001'
    },
    {
        id: 'pay-003',
        type: 'service_fee',
        amount: 250,
        status: 'completed',
        property_id: 'prop-002',
        property_title: 'Modern 2-Bedroom Apartment',
        date: subDays(NOW, 20).toISOString(),
        reference: 'FEE-2024-001'
    },
    // Utility Bills - Pending
    {
        id: 'pay-004',
        type: 'electric',
        amount: 85,
        status: 'pending',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: addDays(NOW, 7).toISOString(),
        reference: 'ELEC-2024-001',
        provider: 'British Gas'
    },
    {
        id: 'pay-005',
        type: 'water',
        amount: 45,
        status: 'due_soon',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: addDays(NOW, 3).toISOString(),
        reference: 'WAT-2024-001',
        provider: 'Thames Water'
    },
    {
        id: 'pay-006',
        type: 'gas',
        amount: 65,
        status: 'pending',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: addDays(NOW, 10).toISOString(),
        reference: 'GAS-2024-001',
        provider: 'British Gas'
    },
    {
        id: 'pay-007',
        type: 'internet',
        amount: 35,
        status: 'due_soon',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: addDays(NOW, 2).toISOString(),
        reference: 'NET-2024-001',
        provider: 'BT Broadband'
    },
    // Utility Bills - Completed (History)
    {
        id: 'pay-008',
        type: 'electric',
        amount: 78,
        status: 'completed',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: subDays(NOW, 25).toISOString(),
        reference: 'ELEC-2023-012',
        provider: 'British Gas'
    },
    {
        id: 'pay-009',
        type: 'water',
        amount: 42,
        status: 'completed',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: subDays(NOW, 28).toISOString(),
        reference: 'WAT-2023-012',
        provider: 'Thames Water'
    },
    {
        id: 'pay-010',
        type: 'gas',
        amount: 72,
        status: 'completed',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: subDays(NOW, 30).toISOString(),
        reference: 'GAS-2023-012',
        provider: 'British Gas'
    },
    {
        id: 'pay-011',
        type: 'council_tax',
        amount: 150,
        status: 'upcoming',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: addDays(NOW, 15).toISOString(),
        reference: 'TAX-2024-001',
        provider: 'Kensington Council'
    }
];

// ============================================================================
// MOCK REVIEWS
// ============================================================================

export const MOCK_REVIEWS = [
    {
        id: 'rev-001',
        property_id: 'prop-003',
        property: MOCK_PROPERTIES[2],
        rating: 5,
        title: 'Absolutely stunning cottage!',
        content: 'The photos don\'t do it justice. The cottage is even more beautiful in person. Sarah was incredibly helpful throughout the viewing.',
        author: 'Alex Mercer',
        date: subDays(NOW, 5).toISOString()
    },
    {
        id: 'rev-002',
        property_id: 'prop-002',
        property: MOCK_PROPERTIES[1],
        rating: 4,
        title: 'Great apartment, minor issues',
        content: 'Lovely apartment with amazing views. The only downside is the noise from the nearby construction. Otherwise perfect.',
        author: 'Alex Mercer',
        date: subDays(NOW, 12).toISOString()
    }
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export const getProperties = (type = 'all', filters = {}) => {
    let filtered = [...MOCK_PROPERTIES];

    if (type === 'buy' || type === 'sale') {
        filtered = filtered.filter(p => p.property_type === 'sale');
    } else if (type === 'rent') {
        filtered = filtered.filter(p => p.property_type === 'rent');
    }

    if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms);
    }
    if (filters.location) {
        const loc = filters.location.toLowerCase();
        filtered = filtered.filter(p =>
            p.city.toLowerCase().includes(loc) ||
            p.postcode.toLowerCase().includes(loc) ||
            p.address_line_1.toLowerCase().includes(loc)
        );
    }

    return filtered;
};

export const getPropertyById = (id) => {
    return MOCK_PROPERTIES.find(p => p.id === id) || MOCK_PROPERTIES[0];
};

export const getSavedProperties = () => MOCK_SAVED_PROPERTIES;
export const getApplications = () => MOCK_APPLICATIONS;
export const getViewings = () => MOCK_VIEWINGS;
export const getMessages = () => MOCK_MESSAGES;
export const getPayments = () => MOCK_PAYMENTS;
export const getReviews = () => MOCK_REVIEWS;
export const getUserProfile = () => MOCK_USER_PROFILE;

// Overseas properties exports
export const getOverseasProperties = (filters = {}) => {
    let filtered = [...MOCK_OVERSEAS_PROPERTIES];

    if (filters.country) {
        filtered = filtered.filter(p => p.country_code === filters.country);
    }

    if (filters.type === 'buy' || filters.type === 'sale') {
        filtered = filtered.filter(p => p.property_type === 'sale');
    } else if (filters.type === 'rent') {
        filtered = filtered.filter(p => p.property_type === 'rent');
    }

    if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms);
    }
    if (filters.city) {
        const cityLower = filters.city.toLowerCase();
        filtered = filtered.filter(p => p.city.toLowerCase().includes(cityLower));
    }

    return filtered;
};

export const getOverseasPropertyById = (id) => {
    return MOCK_OVERSEAS_PROPERTIES.find(p => p.id === id) || MOCK_OVERSEAS_PROPERTIES[0];
};

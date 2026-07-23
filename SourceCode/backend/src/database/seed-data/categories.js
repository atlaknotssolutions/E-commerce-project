/**
 * Official Category Seed Dataset
 *
 * Hierarchical 3-level category structure for the marketplace.
 * This is the single source of truth for category seeding.
 *
 * Structure:
 * - Level 1: Root categories (Men, Women, Electronics, Home & Furniture)
 * - Level 2: Sub-categories (Topwear, Footwear, Mobiles, etc.)
 * - Level 3: Leaf categories (T-Shirts, Jeans, Sneakers, etc.)
 */

export const categorySeedData = [
    // =====================================================================
    // LEVEL 1: MEN
    // =====================================================================
    {
        name: "Men",
        categoryId: "men",
        level: 1,
        children: [
            {
                name: "Topwear",
                categoryId: "men_topwear",
                level: 2,
                children: [
                    { name: "Men T-Shirts", categoryId: "men_t_shirts", level: 3 },
                    { name: "Men Casual Shirts", categoryId: "men_casual_shirts", level: 3 },
                    { name: "Men Formal Shirts", categoryId: "men_formal_shirts", level: 3 },
                    { name: "Men Sweatshirts", categoryId: "men_sweatshirts", level: 3 },
                    { name: "Men Sweaters", categoryId: "men_sweaters", level: 3 },
                    { name: "Men Jackets", categoryId: "men_jackets", level: 3 },
                    { name: "Men Blazers & Coats", categoryId: "men_blazers_and_coats", level: 3 },
                    { name: "Men Suits", categoryId: "men_suits", level: 3 },
                    { name: "Men Rain Jackets", categoryId: "men_rain_jackets", level: 3 },
                    { name: "Men Indian & Festive Wear", categoryId: "men_indian_and_festive_wear", level: 3 },
                    { name: "Men Kurtas & Kurta Sets", categoryId: "men_kurtas_and_kurta_sets", level: 3 },
                    { name: "Men Sherwanis", categoryId: "men_sherwanis", level: 3 },
                    { name: "Men Nehru Jackets", categoryId: "men_nehru_jackets", level: 3 },
                    { name: "Men Dhotis", categoryId: "men_dhotis", level: 3 },
                ],
            },
            {
                name: "Bottomwear",
                categoryId: "men_bottomwear",
                level: 2,
                children: [
                    { name: "Men Jeans", categoryId: "men_jeans", level: 3 },
                    { name: "Men Casual Trousers", categoryId: "men_casual_trousers", level: 3 },
                    { name: "Men Formal Trousers", categoryId: "men_formal_trousers", level: 3 },
                    { name: "Men Shorts", categoryId: "men_shorts", level: 3 },
                    { name: "Men Track Pants & Joggers", categoryId: "men_track_pants_and_joggers", level: 3 },
                ],
            },
            {
                name: "Innerwear & Sleepwear",
                categoryId: "men_innerwear_and_sleepwear",
                level: 2,
                children: [
                    { name: "Men Briefs & Trunks", categoryId: "men_briefs_and_trunks", level: 3 },
                    { name: "Men Boxers", categoryId: "men_boxers", level: 3 },
                    { name: "Men Vests", categoryId: "men_vests", level: 3 },
                    { name: "Men Sleepwear & Loungewear", categoryId: "men_sleepwear_and_loungewear", level: 3 },
                    { name: "Men Thermals", categoryId: "men_thermals", level: 3 },
                    { name: "Men Plus Size", categoryId: "men_plus_size", level: 3 },
                ],
            },
            {
                name: "Footwear",
                categoryId: "men_footwear",
                level: 2,
                children: [
                    { name: "Men Casual Shoes", categoryId: "men_casual_shoes", level: 3 },
                    { name: "Men Sports Shoes", categoryId: "men_sports_shoes", level: 3 },
                    { name: "Men Formal Shoes", categoryId: "men_formal_shoes", level: 3 },
                    { name: "Men Sneakers", categoryId: "men_sneakers", level: 3 },
                    { name: "Men Sandals & Floaters", categoryId: "men_sandals_and_floaters", level: 3 },
                    { name: "Men Flip Flops", categoryId: "men_flip_flops", level: 3 },
                    { name: "Men Socks", categoryId: "men_socks", level: 3 },
                ],
            },
            {
                name: "Personal Care & Grooming",
                categoryId: "men_personal_care_and_grooming",
                level: 2,
                children: [
                    { name: "Men Sunglasses & Frames", categoryId: "men_sunglasses_and_frames", level: 3 },
                    { name: "Men Watches", categoryId: "men_watches", level: 3 },
                    { name: "Men Sports & Active Wear", categoryId: "men_sports_and_active_wear", level: 3 },
                    { name: "Men Sports Sandals", categoryId: "men_sports_sandals", level: 3 },
                    { name: "Men Active T-Shirts", categoryId: "men_active_t_shirts", level: 3 },
                    { name: "Men Track Pants & Shorts", categoryId: "men_track_pants_and_shorts", level: 3 },
                    { name: "Men Tracksuits", categoryId: "men_tracksuits", level: 3 },
                    { name: "Men Jackets & Sweatshirts", categoryId: "men_jackets_and_sweatshirts", level: 3 },
                    { name: "Men Sports Accessories", categoryId: "men_sports_accessories", level: 3 },
                    { name: "Men Swimwear", categoryId: "men_swimwear", level: 3 },
                ],
            },
            {
                name: "Fashion Accessories",
                categoryId: "men_fashion_accessories",
                level: 2,
                children: [
                    { name: "Men Wallets", categoryId: "men_wallets", level: 3 },
                    { name: "Men Belts", categoryId: "men_belts", level: 3 },
                    { name: "Men Perfumes & Body Mists", categoryId: "men_perfumes_and_body_mists", level: 3 },
                    { name: "Men Trimmers", categoryId: "men_trimmers", level: 3 },
                    { name: "Men Deodorants", categoryId: "men_deodorants", level: 3 },
                    { name: "Men Ties, Cufflinks & Pocket Squares", categoryId: "men_ties_cufflinks_and_pocket_squares", level: 3 },
                    { name: "Men Accessory Gift Sets", categoryId: "men_accessory_gift_sets", level: 3 },
                    { name: "Men Caps & Hats", categoryId: "men_caps_and_hats", level: 3 },
                    { name: "Men Mufflers, Scarves & Gloves", categoryId: "men_mufflers_scarves_and_gloves", level: 3 },
                    { name: "Men Phone Cases", categoryId: "men_phone_cases", level: 3 },
                    { name: "Men Rings & Wristwear", categoryId: "men_rings_and_wristwear", level: 3 },
                    { name: "Men Helmets", categoryId: "men_helmets", level: 3 },
                ],
            },
            {
                name: "Gadgets",
                categoryId: "men_gadgets",
                level: 2,
                children: [
                    { name: "Men Smart Wearables", categoryId: "men_smart_wearables", level: 3 },
                    { name: "Men Fitness Gadgets", categoryId: "men_fitness_gadgets", level: 3 },
                    { name: "Men Headphones", categoryId: "men_headphones", level: 3 },
                    { name: "Men Speakers", categoryId: "men_speakers", level: 3 },
                ],
            },
            {
                name: "Bags & Backpacks",
                categoryId: "men_bags_and_backpacks",
                level: 2,
                children: [
                    { name: "Men Bags & Backpacks", categoryId: "men_bags_backpacks", level: 3 },
                    { name: "Men Luggages & Trolleys", categoryId: "men_luggages_and_trolleys", level: 3 },
                ],
            },
        ],
    },

    // =====================================================================
    // LEVEL 1: WOMEN
    // =====================================================================
    {
        name: "Women",
        categoryId: "women",
        level: 1,
        children: [
            {
                name: "Indian & Fusion Wear",
                categoryId: "women_indian_and_fusion_wear",
                level: 2,
                children: [
                    { name: "Women Kurtas & Suits", categoryId: "women_kurtas_and_suits", level: 3 },
                    { name: "Women Kurtis, Tunics & Tops", categoryId: "women_kurtis_tunics_tops", level: 3 },
                    { name: "Women Sarees", categoryId: "women_sarees", level: 3 },
                    { name: "Women Ethnic Wear", categoryId: "women_ethnic_wear", level: 3 },
                    { name: "Women Leggings, Salwars & Churidars", categoryId: "women_leggings_salwars_churidars", level: 3 },
                    { name: "Women Skirts & Palazzos", categoryId: "women_skirts_palazzos", level: 3 },
                    { name: "Women Dress Materials", categoryId: "women_dress_materials", level: 3 },
                    { name: "Women Lehenga Cholis", categoryId: "women_lehenga_cholis", level: 3 },
                    { name: "Women Dupattas & Shawls", categoryId: "women_dupattas_shawls", level: 3 },
                    { name: "Women Jackets", categoryId: "women_jackets", level: 3 },
                    { name: "Women Belts, Scarves & More", categoryId: "women_belts_scarves_more", level: 3 },
                    { name: "Women Watches & Wearables", categoryId: "women_watches_wearables", level: 3 },
                ],
            },
            {
                name: "Western Wear",
                categoryId: "women_western_wear",
                level: 2,
                children: [
                    { name: "Women Dresses", categoryId: "women_dresses", level: 3 },
                    { name: "Women Tops", categoryId: "women_tops", level: 3 },
                    { name: "Women Tshirts", categoryId: "women_tshirts", level: 3 },
                    { name: "Women Jeans", categoryId: "women_jeans", level: 3 },
                    { name: "Women Trousers & Capris", categoryId: "women_trousers_capris", level: 3 },
                    { name: "Women Shorts & Skirts", categoryId: "women_shorts_skirts", level: 3 },
                    { name: "Women Co-ords", categoryId: "women_coords", level: 3 },
                    { name: "Women Playsuits", categoryId: "women_playsuits", level: 3 },
                    { name: "Women Jumpsuits", categoryId: "women_jumpsuits", level: 3 },
                    { name: "Women Shrugs", categoryId: "women_shrugs", level: 3 },
                    { name: "Women Sweaters & Sweatshirts", categoryId: "women_sweaters_sweatshirts", level: 3 },
                    { name: "Women Jackets & Coats", categoryId: "women_jackets_coats", level: 3 },
                    { name: "Women Blazers & Waistcoats", categoryId: "women_blazers_waistcoats", level: 3 },
                    { name: "Women Plus Size", categoryId: "women_plus_size", level: 3 },
                    { name: "Women Maternity", categoryId: "women_maternity", level: 3 },
                    { name: "Women Sunglasses & Frames", categoryId: "women_sunglasses_frames", level: 3 },
                ],
            },
            {
                name: "Footwear",
                categoryId: "women_footwear",
                level: 2,
                children: [
                    { name: "Women Flats", categoryId: "women_flats", level: 3 },
                    { name: "Women Casual Shoes", categoryId: "women_casual_shoes", level: 3 },
                    { name: "Women Heels", categoryId: "women_heels", level: 3 },
                    { name: "Women Boots", categoryId: "women_boots", level: 3 },
                    { name: "Women Sports Shoes & Floaters", categoryId: "women_sports_shoes_floaters", level: 3 },
                ],
            },
            {
                name: "Sports & Active Wear",
                categoryId: "women_sports_active_wear",
                level: 2,
                children: [
                    { name: "Women Clothing", categoryId: "women_clothing", level: 3 },
                    { name: "Women Sports Accessories", categoryId: "women_sports_accessories", level: 3 },
                    { name: "Women Sports Equipment", categoryId: "women_sports_equipment", level: 3 },
                ],
            },
            {
                name: "Lingerie & Sleepwear",
                categoryId: "women_lingerie_sleepwear",
                level: 2,
                children: [
                    { name: "Women Bra", categoryId: "women_bra", level: 3 },
                    { name: "Women Briefs", categoryId: "women_briefs", level: 3 },
                    { name: "Women Shapewear", categoryId: "women_shapewear", level: 3 },
                    { name: "Women Sleepwear & Loungewear", categoryId: "women_sleepwear_loungewear", level: 3 },
                    { name: "Women Swimwear", categoryId: "women_swimwear", level: 3 },
                    { name: "Women Camisoles & Thermals", categoryId: "women_camisoles_thermals", level: 3 },
                ],
            },
            {
                name: "Beauty & Personal Care",
                categoryId: "women_beauty_personal_care",
                level: 2,
                children: [
                    { name: "Women Makeup", categoryId: "women_makeup", level: 3 },
                    { name: "Women Skincare", categoryId: "women_skincare", level: 3 },
                    { name: "Women Premium Beauty", categoryId: "women_premium_beauty", level: 3 },
                    { name: "Women Lipsticks", categoryId: "women_lipsticks", level: 3 },
                    { name: "Women Fragrances", categoryId: "women_fragrances", level: 3 },
                ],
            },
            {
                name: "Gadgets",
                categoryId: "women_gadgets",
                level: 2,
                children: [
                    { name: "Women Smart Wearables", categoryId: "women_smart_wearables", level: 3 },
                    { name: "Women Fitness Gadgets", categoryId: "women_fitness_gadgets", level: 3 },
                    { name: "Women Headphones", categoryId: "women_headphones", level: 3 },
                    { name: "Women Speakers", categoryId: "women_speakers", level: 3 },
                ],
            },
            {
                name: "Jewellery",
                categoryId: "women_jewellery",
                level: 2,
                children: [
                    { name: "Women Fashion Jewellery", categoryId: "women_fashion_jewellery", level: 3 },
                    { name: "Women Fine Jewellery", categoryId: "women_fine_jewellery", level: 3 },
                    { name: "Women Earrings", categoryId: "women_earrings", level: 3 },
                ],
            },
            {
                name: "Handbags, Bags & Wallets",
                categoryId: "women_handbags_bags_wallets",
                level: 2,
                children: [
                    { name: "Women Backpacks", categoryId: "women_backpacks", level: 3 },
                    { name: "Women Luggages & Trolleys", categoryId: "women_luggages_trolleys", level: 3 },
                ],
            },
        ],
    },

    // =====================================================================
    // LEVEL 1: ELECTRONICS
    // =====================================================================
    {
        name: "Electronics",
        categoryId: "electronics",
        level: 1,
        children: [
            {
                name: "Mobiles",
                categoryId: "mobiles",
                level: 2,
                children: [
                    { name: "Mi Mobile", categoryId: "mi_mobile", level: 3 },
                    { name: "Realme Mobile", categoryId: "realme_mobile", level: 3 },
                    { name: "Samsung Mobile", categoryId: "samsung_mobile", level: 3 },
                    { name: "Infinix Mobile", categoryId: "infinix_mobile", level: 3 },
                    { name: "OPPO Mobile", categoryId: "oppo_mobile", level: 3 },
                    { name: "Apple Mobile", categoryId: "apple_mobile", level: 3 },
                    { name: "Vivo Mobile", categoryId: "vivo_mobile", level: 3 },
                    { name: "Honor Mobile", categoryId: "honor_mobile", level: 3 },
                    { name: "Asus Mobile", categoryId: "asus_mobile", level: 3 },
                    { name: "Poco X2 Mobile", categoryId: "poco_x2_mobile", level: 3 },
                    { name: "Realme Narzo 10 Mobile", categoryId: "realme_narzo_10_mobile", level: 3 },
                    { name: "Infinix Hot 9 Mobile", categoryId: "infinix_hot_9_mobile", level: 3 },
                    { name: "IQOO 3 Mobile", categoryId: "iqoo_3_mobile", level: 3 },
                    { name: "iPhone SE Mobile", categoryId: "iphone_se_mobile", level: 3 },
                    { name: "Motorola razr Mobile", categoryId: "motorola_razr_mobile", level: 3 },
                    { name: "Realme Narzo 10A Mobile", categoryId: "realme_narzo_10a_mobile", level: 3 },
                    { name: "Motorola g8 power lite Mobile", categoryId: "motorola_g8_power_lite_mobile", level: 3 },
                ],
            },
            {
                name: "Mobile Accessories",
                categoryId: "mobile_accessories",
                level: 2,
                children: [
                    { name: "Mobile Cases", categoryId: "mobile_cases", level: 3 },
                    { name: "Headphones & Headsets", categoryId: "headphones_headsets", level: 3 },
                    { name: "Power Banks", categoryId: "power_banks", level: 3 },
                    { name: "Screenguards", categoryId: "screenguards", level: 3 },
                    { name: "Memory Cards", categoryId: "memory_cards", level: 3 },
                    { name: "Smart Headphones", categoryId: "smart_headphones", level: 3 },
                    { name: "Mobile Cables", categoryId: "mobile_cables", level: 3 },
                    { name: "Mobile Chargers", categoryId: "mobile_chargers", level: 3 },
                    { name: "Mobile Holders", categoryId: "mobile_holders", level: 3 },
                ],
            },
            {
                name: "Smart Wearable Tech",
                categoryId: "smart_wearable_tech",
                level: 2,
                children: [
                    { name: "Smart Watches", categoryId: "smart_watches", level: 3 },
                    { name: "Smart Glasses (VR)", categoryId: "smart_glasses_vr", level: 3 },
                    { name: "Smart Bands", categoryId: "smart_bands", level: 3 },
                ],
            },
            {
                name: "Laptops",
                categoryId: "laptops",
                level: 2,
                children: [
                    { name: "Gaming Laptops", categoryId: "gaming_laptops", level: 3 },
                    { name: "Desktop PCs", categoryId: "desktop_pcs", level: 3 },
                    { name: "Gaming & Accessories", categoryId: "gaming_accessories", level: 3 },
                    { name: "Computer Accessories", categoryId: "computer_accessories", level: 3 },
                    { name: "External Hard Disks", categoryId: "external_hard_disks", level: 3 },
                    { name: "Pendrives", categoryId: "pendrives", level: 3 },
                    { name: "Laptop Skins & Decals", categoryId: "laptop_skins_decals", level: 3 },
                    { name: "Laptop Bags", categoryId: "laptop_bags", level: 3 },
                    { name: "Mouse", categoryId: "mouse", level: 3 },
                    { name: "Computer Peripherals", categoryId: "computer_peripherals", level: 3 },
                    { name: "Printers & Ink Cartridges", categoryId: "printers_ink_cartridges", level: 3 },
                    { name: "Monitors", categoryId: "monitors", level: 3 },
                ],
            },
            {
                name: "Tablets",
                categoryId: "tablets",
                level: 2,
                children: [
                    { name: "Apple iPads", categoryId: "apple_ipads", level: 3 },
                ],
            },
            {
                name: "Speakers",
                categoryId: "speakers",
                level: 2,
                children: [
                    { name: "Home Audio Speakers", categoryId: "home_audio_speakers", level: 3 },
                    { name: "Home Theatres", categoryId: "home_theatres", level: 3 },
                    { name: "Soundbars", categoryId: "soundbars", level: 3 },
                    { name: "Bluetooth Speakers", categoryId: "bluetooth_speakers", level: 3 },
                    { name: "DTH Set Top Box", categoryId: "dth_set_top_box", level: 3 },
                ],
            },
            {
                name: "Camera",
                categoryId: "camera",
                level: 2,
                children: [
                    { name: "DSLR & Mirrorless Camera", categoryId: "dslr_mirrorless_camera", level: 3 },
                    { name: "Compact & Bridge Cameras", categoryId: "compact_bridge_cameras", level: 3 },
                    { name: "Sports & Action Camera", categoryId: "sports_action_camera", level: 3 },
                    { name: "Camera Accessories", categoryId: "camera_accessories", level: 3 },
                    { name: "Camera Lens", categoryId: "lens", level: 3 },
                    { name: "Camera Tripods", categoryId: "camera_tripods", level: 3 },
                ],
            },
        ],
    },

    // =====================================================================
    // LEVEL 1: HOME & FURNITURE
    // =====================================================================
    {
        name: "Home & Furniture",
        categoryId: "home_furniture",
        level: 1,
        children: [
            {
                name: "Bed Linen & Furnishing",
                categoryId: "bed_linen_furnishing",
                level: 2,
                children: [
                    { name: "Bed Runners", categoryId: "bed_runners", level: 3 },
                    { name: "Mattress Protectors", categoryId: "mattress_protectors", level: 3 },
                    { name: "Bedsheets", categoryId: "bedsheets", level: 3 },
                    { name: "Bedding Sets", categoryId: "bedding_sets", level: 3 },
                    { name: "Blankets, Quilts & Dohars", categoryId: "blankets_quilts_dohars", level: 3 },
                    { name: "Pillows & Pillow Covers", categoryId: "pillows_pillow_covers", level: 3 },
                    { name: "Bed Covers", categoryId: "bed_covers", level: 3 },
                    { name: "Diwan Sets", categoryId: "diwan_sets", level: 3 },
                    { name: "Chair Pads & Covers", categoryId: "chair_pads_covers", level: 3 },
                    { name: "Sofa Covers", categoryId: "sofa_covers", level: 3 },
                ],
            },
            {
                name: "Flooring",
                categoryId: "flooring",
                level: 2,
                children: [
                    { name: "Floor Runners", categoryId: "floor_runners", level: 3 },
                    { name: "Carpets", categoryId: "carpets", level: 3 },
                    { name: "Floor Mats & Dhurries", categoryId: "floor_mats_dhurries", level: 3 },
                    { name: "Door Mats", categoryId: "door_mats", level: 3 },
                ],
            },
            {
                name: "Bath",
                categoryId: "bath",
                level: 2,
                children: [
                    { name: "Bath Towels", categoryId: "bath_towels", level: 3 },
                    { name: "Hand & Face Towels", categoryId: "hand_face_towels", level: 3 },
                    { name: "Beach Towels", categoryId: "beach_towels", level: 3 },
                    { name: "Towels Set", categoryId: "towels_set", level: 3 },
                    { name: "Bath Rugs", categoryId: "bath_rugs", level: 3 },
                    { name: "Bath Robes", categoryId: "bath_robes", level: 3 },
                    { name: "Bathroom Accessories", categoryId: "bathroom_accessories", level: 3 },
                    { name: "Shower Curtains", categoryId: "shower_curtains", level: 3 },
                ],
            },
            {
                name: "Lamps & Lighting",
                categoryId: "lamps_lighting",
                level: 2,
                children: [
                    { name: "Floor Lamps", categoryId: "floor_lamps", level: 3 },
                    { name: "Ceiling Lamps", categoryId: "ceiling_lamps", level: 3 },
                    { name: "Table Lamps", categoryId: "table_lamps", level: 3 },
                    { name: "Wall Lamps", categoryId: "wall_lamps", level: 3 },
                    { name: "Outdoor Lamps", categoryId: "outdoor_lamps", level: 3 },
                    { name: "String Lights", categoryId: "string_lights", level: 3 },
                ],
            },
            {
                name: "Home Decor",
                categoryId: "home_decor",
                level: 2,
                children: [
                    { name: "Plants & Planters", categoryId: "plants_planters", level: 3 },
                    { name: "Aromas & Candles", categoryId: "aromas_candles", level: 3 },
                    { name: "Clocks", categoryId: "clocks", level: 3 },
                    { name: "Mirrors", categoryId: "mirrors", level: 3 },
                    { name: "Wall Decor", categoryId: "wall_decor", level: 3 },
                    { name: "Festive Decor", categoryId: "festive_decor", level: 3 },
                    { name: "Pooja Essentials", categoryId: "pooja_essentials", level: 3 },
                    { name: "Wall Shelves", categoryId: "wall_shelves", level: 3 },
                    { name: "Fountains", categoryId: "fountains", level: 3 },
                    { name: "Showpieces & Vases", categoryId: "showpieces_vases", level: 3 },
                    { name: "Ottoman", categoryId: "ottoman", level: 3 },
                    { name: "Cushions & Cushion Covers", categoryId: "cushions_cushion_covers", level: 3 },
                    { name: "Curtains", categoryId: "curtains", level: 3 },
                    { name: "Home Gift Sets", categoryId: "home_gift_sets", level: 3 },
                ],
            },
            {
                name: "Kitchen & Table",
                categoryId: "kitchen_table",
                level: 2,
                children: [
                    { name: "Table Runners", categoryId: "table_runners", level: 3 },
                    { name: "Dinnerware & Serveware", categoryId: "dinnerware_serveware", level: 3 },
                    { name: "Cups and Mugs", categoryId: "cups_mugs", level: 3 },
                    { name: "Bakeware & Cookware", categoryId: "bakeware_cookware", level: 3 },
                    { name: "Kitchen Storage & Tools", categoryId: "kitchen_storage_tools", level: 3 },
                    { name: "Bar & Drinkware", categoryId: "bar_drinkware", level: 3 },
                    { name: "Table Covers & Furnishings", categoryId: "table_covers_furnishings", level: 3 },
                ],
            },
        ],
    },
];

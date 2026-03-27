-- =====================================================
-- EXPERT CONSULTANCY BOOKING SYSTEM
-- Adds experts directory and booking management
-- =====================================================

-- ==================== EXPERTS TABLE ====================
CREATE TABLE public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  bio TEXT,
  experience_years INTEGER,
  rating NUMERIC DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  daily_rate NUMERIC NOT NULL DEFAULT 250,
  monthly_rate NUMERIC NOT NULL DEFAULT 3000,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  image_url TEXT,
  phone TEXT,
  email TEXT,
  languages TEXT[] DEFAULT ARRAY['English', 'Hindi'],
  certifications TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== EXPERT BOOKINGS TABLE ====================
CREATE TABLE public.expert_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expert_id UUID REFERENCES public.experts(id) ON DELETE RESTRICT NOT NULL,
  booking_date DATE NOT NULL,
  duration TEXT NOT NULL CHECK (duration IN ('daily', 'monthly')),
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== EXPERT REVIEWS TABLE ====================
CREATE TABLE public.expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID REFERENCES public.experts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.expert_bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

-- EXPERTS: Public read
CREATE POLICY "Anyone can view experts" ON public.experts FOR SELECT USING (true);

-- EXPERT BOOKINGS: User can manage own bookings
CREATE POLICY "Users can view own bookings" ON public.expert_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.expert_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.expert_bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel own bookings" ON public.expert_bookings FOR DELETE USING (auth.uid() = user_id);

-- EXPERT REVIEWS: Anyone can read, user can create own
CREATE POLICY "Anyone can view expert reviews" ON public.expert_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.expert_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.expert_reviews FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA - 80 EXPERT PROFILES
-- =====================================================

INSERT INTO public.experts (name, specialty, bio, experience_years, rating, reviews_count, daily_rate, monthly_rate, image_url, languages, certifications) VALUES
('Dr. Rajesh Kumar', 'Soil Management', 'PhD in Soil Science with 15+ years of farming consulting experience', 15, 4.9, 127, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh', ARRAY['English', 'Hindi', 'Punjabi'], ARRAY['ISO 14001', 'Soil Science Certification']),
('Priya Sharma', 'Organic Farming', 'Expert in organic certification and sustainable farming practices', 12, 4.8, 98, 280, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', ARRAY['English', 'Hindi'], ARRAY['NPOP Certified', 'Organic Master Trainer']),
('Amit Patel', 'Irrigation Systems', 'Specialist in drip irrigation and water conservation techniques', 10, 4.7, 85, 250, 3000, 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit', ARRAY['English', 'Gujarati', 'Hindi'], ARRAY['Drip Irrigation Expert', 'Water Management']),
('Dr. Meena Singh', 'Crop Science', 'Agricultural scientist specializing in high-yield crop varieties', 18, 4.9, 142, 350, 4000, 'https://api.dicebear.com/7.x/avataaars/svg?seed=meena', ARRAY['English', 'Hindi'], ARRAY['PhD Agriculture', 'Crop Breeding Specialist']),
('Vikram Desai', 'Pest Management', 'IPM specialist with proven track record in organic pest control', 11, 4.6, 76, 240, 2800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram', ARRAY['English', 'Marathi', 'Hindi'], ARRAY['IPM Certified', 'Entomology Expert']),
('Neha Gupta', 'Farm Business', 'Business consultant helping farmers scale operations profitably', 9, 4.8, 104, 320, 3600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha', ARRAY['English', 'Hindi'], ARRAY['MBA Agriculture', 'Business Consultant']),
('Sanjay Rao', 'Weather Advisory', 'Meteorologist providing climate-smart farming guidance', 13, 4.7, 91, 220, 2600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sanjay', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Meteorology Expert', 'Climate Advisor']),
('Dr. Anjali Nair', 'Horticulture', 'Specialist in vegetable and fruit cultivation techniques', 14, 4.9, 118, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjali', ARRAY['English', 'Malayalam', 'Hindi'], ARRAY['Horticulture PhD', 'Vegetable Science Expert']),
('Rohit Verma', 'Machinery & Equipment', 'Farm mechanization expert guiding equipment selection', 8, 4.5, 62, 200, 2400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohit', ARRAY['English', 'Hindi'], ARRAY['Agricultural Engineering', 'Machinery Expert']),
('Pallavi Negi', 'Dairy Farming', 'Integrated dairy farming consultant for milk production optimization', 10, 4.8, 101, 280, 3300, 'https://api.dicebear.com/7.x/avataaars/svg?seed=pallavi', ARRAY['English', 'Hindi'], ARRAY['Dairy Science', 'Veterinary Consultant']),
('Dr. Suresh Chandra', 'Plant Nutrition', 'Plant nutrient specialist optimizing fertilizer use', 16, 4.8, 135, 330, 3700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=suresh', ARRAY['English', 'Hindi', 'Kannada'], ARRAY['Soil & Plant Nutrition PhD', 'Mineral Expert']),
('Ravi Singh', 'Rice Cultivation', 'Rice farming expert with focus on high-yield varieties', 11, 4.7, 88, 250, 3000, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ravi', ARRAY['English', 'Hindi', 'Punjabi'], ARRAY['Rice Science Specialist']),
('Dr. Kamini Reddy', 'Spice Farming', 'Specialist in turmeric, chili, and other spice cultivation', 12, 4.9, 119, 310, 3600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamini', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Spice Science PhD', 'Quality Assurance Expert']),
('Arun Kumar', 'Maize & Pulses', 'Expert in maize and pulse varieties and intercropping', 9, 4.6, 79, 230, 2700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=arun', ARRAY['English', 'Hindi'], ARRAY['Crop Science Specialist']),
('Dr. Shruti Bansal', 'Farm Financing', 'Agricultural finance expert helping farmers access credits and schemes', 8, 4.7, 94, 290, 3400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=shruti', ARRAY['English', 'Hindi'], ARRAY['Agricultural Finance Expert', 'Scheme Consultant']),
('Vikrant Yadav', 'Cotton Farming', 'BT cotton specialist with advanced pest management techniques', 13, 4.8, 106, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikrant', ARRAY['English', 'Hindi', 'Marathi'], ARRAY['Cotton Science Expert', 'BT Cotton Specialist']),
('Dr. Pooja Sinha', 'Food Safety', 'Food safety and quality assurance consultant for farm products', 10, 4.8, 97, 320, 3700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=pooja', ARRAY['English', 'Hindi'], ARRAY['Food Safety Certification', 'Quality Expert']),
('Mohan Singh', 'Beekeeping', 'Apiculture expert for integrated bee farming with crops', 7, 4.6, 71, 210, 2500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohan', ARRAY['English', 'Hindi', 'Punjabi'], ARRAY['Apiculture Specialist', 'Bee Expert']),
('Dr. Harini Kumar', 'Floriculture', 'Flower farming expert for high-value crop cultivation', 11, 4.7, 85, 270, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=harini', ARRAY['English', 'Tamil', 'Hindi'], ARRAY['Floriculture PhD', 'Export Consultant']),
('Sandeep Rao', 'Fishery Integration', 'Integrated fish farming with agriculture consultant', 9, 4.5, 68, 240, 2800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sandeep', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Fishery Science', 'Integration Expert']),
('Dr. Neetu Sharma', 'Cold Storage', 'Post-harvest and cold storage management specialist', 10, 4.7, 83, 280, 3300, 'https://api.dicebear.com/7.x/avataaars/svg?seed=neetu', ARRAY['English', 'Hindi'], ARRAY['Post-Harvest Expert', 'Cold Chain Specialist']),
('Rajesh Nair', 'Medicinal Plants', 'Medicinal and aromatic plant cultivation expert', 12, 4.8, 102, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh2', ARRAY['English', 'Malayalam', 'Hindi'], ARRAY['Medicinal Plants Expert', 'Ayurveda Consultant']),
('Dr. Ananya Patel', 'Agroforestry', 'Agroforestry and tree-based farming systems expert', 13, 4.8, 110, 310, 3600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya', ARRAY['English', 'Gujarati', 'Hindi'], ARRAY['Agroforestry PhD', 'Forest Science']),
('Vikram Singh', 'Sugarcane Farming', 'Sugarcane expert with focus on yield optimization', 10, 4.6, 81, 260, 3100, 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram2', ARRAY['English', 'Hindi', 'Punjabi'], ARRAY['Sugarcane Science Specialist']),
('Dr. Isha Chatterjee', 'Soil Testing', 'Soil analysis and microbiological testing specialist', 9, 4.7, 89, 250, 2900, 'https://api.dicebear.com/7.x/avataaars/svg?seed=isha', ARRAY['English', 'Bengali', 'Hindi'], ARRAY['Soil Microbiology PhD', 'Lab Expert']),
('Arjun Kumar', 'Vegetable Farming', 'Year-round vegetable cultivation techniques', 8, 4.5, 76, 220, 2600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun', ARRAY['English', 'Hindi'], ARRAY['Vegetable Science Specialist']),
('Dr. Meera Sharma', 'Disease Management', 'Plant pathologist specializing in disease prevention', 14, 4.9, 128, 340, 3900, 'https://api.dicebear.com/7.x/avataaars/svg?seed=meera', ARRAY['English', 'Hindi'], ARRAY['Plant Pathology PhD', 'Disease Expert']),
('Sanjiv Verma', 'Seed Selection', 'Seed variety selection and procurement expert', 11, 4.7, 94, 240, 2800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sanjiv', ARRAY['English', 'Hindi'], ARRAY['Seed Science Specialist', 'Variety Expert']),
('Dr. Priya Nair', 'Fruit Farming', 'Mango, citrus, and tropical fruit farming expert', 12, 4.8, 115, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya2', ARRAY['English', 'Malayalam', 'Hindi'], ARRAY['Fruit Science PhD', 'Tropical Crops Expert']),
('Rohit Desai', 'Market Linkage', 'Agricultural market expert helping farmers sell at best prices', 10, 4.6, 87, 270, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohit2', ARRAY['English', 'Marathi', 'Hindi'], ARRAY['Agricultural Marketing Expert', 'Agribusiness Consultant']),
('Dr. Anjali Verma', 'Greenhouse Farming', 'Protected cultivation and advanced greenhouse technologies', 9, 4.7, 92, 300, 3400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjali2', ARRAY['English', 'Hindi'], ARRAY['Greenhouse Expert', 'Protected Cultivation Specialist']),
('Suresh Patel', 'Groundnut Farming', 'Groundnut cultivation and processing expert', 10, 4.5, 73, 230, 2700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=suresh2', ARRAY['English', 'Gujarati', 'Hindi'], ARRAY['Groundnut Science Specialist']),
('Dr. Kavya Singh', 'Herbs & Spices', 'High-value herbs and spices cultivation expert', 11, 4.8, 108, 310, 3600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=kavya', ARRAY['English', 'Hindi'], ARRAY['Spice & Herb Expert', 'Quality Assurance']),
('Rajeev Kumar', 'Cotton & Oilseeds', 'Cotton and oilseed crops specialist', 12, 4.7, 99, 270, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajeev', ARRAY['English', 'Hindi'], ARRAY['Cotton Science', 'Oilseed Expert']),
('Dr. Divya Reddy', 'Mushroom Farming', 'High-tech mushroom cultivation expert', 8, 4.6, 80, 290, 3400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=divya', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Mushroom Science Expert', 'Biotech Specialist']),
('Ashok Singh', 'Tea & Coffee', 'Specialty crop expert in tea and coffee cultivation', 13, 4.8, 112, 320, 3700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ashok', ARRAY['English', 'Hindi'], ARRAY['Tea & Coffee Expert', 'Quality Assurance']),
('Dr. Ritu Sharma', 'Honey Production', 'Beekeeping and honey production optimization expert', 10, 4.7, 86, 260, 3100, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ritu', ARRAY['English', 'Hindi'], ARRAY['Apiculture PhD', 'Honey Expert']),
('Nitin Yadav', 'Potato Farming', 'Potato cultivation and storage expert', 9, 4.5, 74, 220, 2600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=nitin', ARRAY['English', 'Hindi'], ARRAY['Potato Science Specialist']),
('Dr. Sneha Kapoor', 'Onion & Garlic', 'Bulb crop specialist with focus on yield and quality', 11, 4.8, 105, 290, 3400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha', ARRAY['English', 'Hindi'], ARRAY['Bulb Crop Expert', 'Storage Specialist']),
('Sanjay Kumar', 'Wheat Farming', 'Wheat production expert for maximum yield', 10, 4.6, 82, 240, 2900, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sanjay2', ARRAY['English', 'Hindi', 'Punjabi'], ARRAY['Cereal Science Specialist']),
('Dr. Nisha Mishra', 'Legume Farming', 'Pulses and legume crop expert', 12, 4.8, 109, 280, 3300, 'https://api.dicebear.com/7.x/avataaars/svg?seed=nisha', ARRAY['English', 'Odia', 'Hindi'], ARRAY['Pulse Science PhD', 'Nitrogen Fixation Expert']),
('Vikram Reddy', 'Farm Labor', 'Agricultural labor management and farm operations expert', 8, 4.4, 65, 200, 2400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram3', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Farm Management', 'HR Consultant']),
('Dr. Chanchal Singh', 'Crop Insurance', 'Agricultural insurance and risk management expert', 9, 4.7, 90, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=chanchal', ARRAY['English', 'Hindi'], ARRAY['Insurance Expert', 'Risk Analyst']),
('Praveen Sinha', 'Jute & Fiber', 'Fiber crops specialist for jute and other fibers', 10, 4.5, 75, 230, 2700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=praveen', ARRAY['English', 'Bengali', 'Hindi'], ARRAY['Fiber Science', 'Textile Expert']),
('Dr. Anjali Gupta', 'Bamboo Farming', 'Bamboo cultivation and product development expert', 9, 4.7, 93, 310, 3600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjali3', ARRAY['English', 'Hindi'], ARRAY['Bamboo Expert', 'Sustainability Specialist']),
('Dilip Kumar', 'Rubber Farming', 'Rubber and plantation crop specialist', 11, 4.6, 84, 270, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=dilip', ARRAY['English', 'Hindi'], ARRAY['Plantation Crop Expert']),
('Dr. Simran Sharma', 'Vegetable Processing', 'Farm-to-table vegetable processing expert', 10, 4.8, 103, 320, 3700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=simran', ARRAY['English', 'Hindi'], ARRAY['Food Processing Expert', 'Quality Assurance']),
('Murali Krishna', 'Aquaponics', 'Integrated fish and plant farming system expert', 8, 4.5, 72, 250, 3000, 'https://api.dicebear.com/7.x/avataaars/svg?seed=murali', ARRAY['English', 'Telugu', 'Kannada', 'Hindi'], ARRAY['Aquaponics Expert', 'Biotech Specialist']),
('Dr. Priyanka Negi', 'Silkworm Farming', 'Sericulture and silk production expert', 9, 4.7, 91, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=priyanka', ARRAY['English', 'Hindi'], ARRAY['Sericulture PhD', 'Textile Expert']),
('Ramesh Rao', 'Sugarcane Processing', 'Sugar production and processing technology expert', 12, 4.6, 86, 280, 3300, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ramesh', ARRAY['English', 'Hindi', 'Telugu'], ARRAY['Sugar Technology Expert']),
('Dr. Meghna Iyer', 'Coconut Farming', 'Coconut cultivation and value-added products expert', 11, 4.8, 107, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=meghna', ARRAY['English', 'Tamil', 'Malayalam', 'Hindi'], ARRAY['Coconut Expert', 'Value Addition Specialist']),
('Sanjeev Patel', 'Soybean Farming', 'Soybean cultivation and crop rotation expert', 10, 4.5, 77, 240, 2800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sanjeev', ARRAY['English', 'Gujarati', 'Hindi'], ARRAY['Soybean Science Specialist']),
('Dr. Veena Sharma', 'Pomegranate & Grapes', 'Premium fruit crops specialist', 11, 4.8, 111, 320, 3800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=veena', ARRAY['English', 'Hindi', 'Marathi'], ARRAY['Fruit Science PhD', 'Export Expert']),
('Arjun Singh', 'Sunflower Farming', 'Sunflower and other oilseed crops expert', 9, 4.5, 70, 220, 2600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun2', ARRAY['English', 'Hindi'], ARRAY['Oilseed Science Specialist']),
('Dr. Smita Verma', 'Dragon Fruit', 'Exotic fruit farming in India expert', 8, 4.7, 95, 330, 3900, 'https://api.dicebear.com/7.x/avataaars/svg?seed=smita', ARRAY['English', 'Hindi'], ARRAY['Exotic Crops Expert', 'Horticulture Specialist']),
('Nikhil Desai', 'Turmeric Farming', 'Turmeric and ginger cultivation and processing expert', 10, 4.6, 88, 260, 3100, 'https://api.dicebear.com/7.x/avataaars/svg?seed=nikhil', ARRAY['English', 'Marathi', 'Hindi'], ARRAY['Spice Specialist', 'Processing Expert']),
('Dr. Rupali Singh', 'Moringa Farming', 'Moringa and nutrient-rich crop expert', 7, 4.7, 84, 290, 3400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rupali', ARRAY['English', 'Hindi'], ARRAY['Nutrition Expert', 'Organic Specialist']),
('Vikram Nair', 'Cashew Farming', 'Cashew cultivation and processing expert', 11, 4.5, 79, 270, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram4', ARRAY['English', 'Malayalam', 'Hindi'], ARRAY['Cashew Expert', 'Processing Specialist']),
('Dr. Harshita Sharma', 'Sapota & Guava', 'Tropical fruit farming specialist', 10, 4.8, 104, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=harshita', ARRAY['English', 'Hindi'], ARRAY['Tropical Fruit Expert', 'Horticulture PhD']),
('Deepak Kumar', 'Lemon Farming', 'Citrus fruit cultivation and quality management expert', 9, 4.6, 83, 250, 2950, 'https://api.dicebear.com/7.x/avataaars/svg?seed=deepak', ARRAY['English', 'Hindi'], ARRAY['Citrus Expert', 'Quality Assurance']),
('Dr. Pallavi Gupta', 'Papaya Farming', 'Papaya cultivation with disease management expert', 8, 4.7, 92, 280, 3300, 'https://api.dicebear.com/7.x/avataaars/svg?seed=pallavi2', ARRAY['English', 'Hindi'], ARRAY['Papaya Expert', 'Disease Management Specialist']),
('Siddharth Reddy', 'Banana Farming', 'Banana cultivation and post-harvest management expert', 10, 4.6, 86, 270, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=siddharth', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Banana Science Specialist', 'Export Expert']),
('Dr. Aadhya Singh', 'Pineapple Farming', 'Pineapple cultivation and value addition expert', 9, 4.7, 96, 310, 3700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=aadhya', ARRAY['English', 'Hindi'], ARRAY['Tropical Fruit Expert', 'Processing Specialist']),
('Rohit Sharma', 'Mustard & Rapeseed', 'Oilseed crops specialist', 11, 4.5, 81, 240, 2850, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohit3', ARRAY['English', 'Hindi', 'Punjabi'], ARRAY['Oilseed Science', 'Crop Specialist']),
('Dr. Natasha Patel', 'Biofortified Crops', 'Nutrition-enriched crop development expert', 9, 4.8, 98, 320, 3700, 'https://api.dicebear.com/7.x/avataaars/svg?seed=natasha', ARRAY['English', 'Gujarati', 'Hindi'], ARRAY['Biofortification Expert', 'Nutrition Scientist']),
('Avinash Kumar', 'Saffron Farming', 'Premium saffron and crocus cultivation expert', 8, 4.7, 89, 350, 4100, 'https://api.dicebear.com/7.x/avataaars/svg?seed=avinash', ARRAY['English', 'Hindi', 'Urdu'], ARRAY['Saffron Expert', 'Premium Crops Specialist']),
('Dr. Leena Nair', 'Stevia Farming', 'Natural sweetener crop cultivation expert', 7, 4.6, 75, 280, 3300, 'https://api.dicebear.com/7.x/avataaars/svg?seed=leena', ARRAY['English', 'Malayalam', 'Hindi'], ARRAY['Stevia Expert', 'Natural Products Specialist']),
('Karun Singh', 'Chili Farming', 'Red chili cultivation and spice trading expert', 10, 4.5, 78, 250, 2950, 'https://api.dicebear.com/7.x/avataaars/svg?seed=karun', ARRAY['English', 'Hindi'], ARRAY['Spice Specialist', 'Trading Expert']),
('Dr. Swati Sharma', 'Safflower Farming', 'Safflower cultivation and value addition expert', 9, 4.7, 94, 290, 3400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=swati', ARRAY['English', 'Hindi'], ARRAY['Oil Crop Expert', 'Dye Specialist']),
('Rathish Reddy', 'Linseed Farming', 'Linseed and flax cultivation expert', 8, 4.4, 68, 220, 2600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rathish', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Linseed Science', 'Fiber Expert']),
('Dr. Priti Verma', 'Nutrition in Crops', 'Crop nutrition and biofortification expert', 10, 4.8, 106, 310, 3600, 'https://api.dicebear.com/7.x/avataaars/svg?seed=priti', ARRAY['English', 'Hindi'], ARRAY['Plant Nutrition PhD', 'Soil Health Expert']),
('Mohan Reddy', 'Walnut & Almonds', 'Premium nut crops specialist', 9, 4.6, 80, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohan2', ARRAY['English', 'Telugu', 'Hindi'], ARRAY['Nut Crop Expert', 'Horticulture Specialist']),
('Dr. Viveka Sharma', 'Fennel & Cumin', 'Small spice crops specialist', 11, 4.7, 97, 270, 3200, 'https://api.dicebear.com/7.x/avataaars/svg?seed=viveka', ARRAY['English', 'Hindi'], ARRAY['Spice Science Expert', 'Aroma Crops Specialist']),
('Suresh Verma', 'Sesame Farming', 'Sesame cultivation and processing expert', 10, 4.5, 76, 240, 2800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=suresh3', ARRAY['English', 'Hindi'], ARRAY['Oil Seed Expert', 'Processing Specialist']),
('Dr. Arpita Singh', 'Coriander & Parsley', 'Herb crops specialist', 8, 4.7, 90, 260, 3100, 'https://api.dicebear.com/7.x/avataaars/svg?seed=arpita', ARRAY['English', 'Hindi'], ARRAY['Herb Expert', 'Culinary Specialist']),
('Nikhil Kumar', 'Fenugreek Farming', 'Fenugreek and methi cultivation expert', 7, 4.5, 69, 210, 2500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=nikhil2', ARRAY['English', 'Hindi'], ARRAY['Herb Specialist', 'Medicinal Crops Expert']),
('Dr. Deepti Nair', 'Crown Rot Management', 'Disease prevention expert in plantation crops', 10, 4.8, 101, 300, 3500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=deepti', ARRAY['English', 'Malayalam', 'Hindi'], ARRAY['Pathology PhD', 'Pest Management Expert']),
('Rajesh Singh', 'Hops Farming', 'Beer ingredient crop specialist', 6, 4.4, 52, 240, 2800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh3', ARRAY['English', 'Hindi'], ARRAY['Specialized Crops Expert']),
('Dr. Neha Iyer', 'Indigo & Dyes', 'Natural dye plant cultivation expert', 9, 4.6, 82, 290, 3400, 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha2', ARRAY['English', 'Tamil', 'Hindi'], ARRAY['Dye Plants Expert', 'Natural Products Specialist']);

-- =====================================================
-- SAMPLE BOOKINGS & REVIEWS (Optional)
-- =====================================================

-- Demo bookings (if you have demo user ID, replace uuid below)
-- INSERT INTO public.expert_bookings (user_id, expert_id, booking_date, duration, total_amount, status, payment_status)
-- SELECT auth.users.id, experts.id, now()::date + 7, 'daily', experts.daily_rate, 'confirmed', 'completed'
-- FROM auth.users, public.experts
-- WHERE auth.users.email = 'demo@krishigrow.ai'
-- LIMIT 1;

import { ThemePreset } from './types.js';

export const THEME_PRESETS: ThemePreset[] = [
  { category: 'Animals', theme: 'Apex Predators', keyword: 'Bengal Tiger', hint: 'Striped king of the jungle', difficulty: 'Easy' },
  { category: 'Animals', theme: 'Ocean Giants', keyword: 'Blue Whale', hint: 'Largest creature ever known', difficulty: 'Easy' },
  { category: 'Animals', theme: 'Clever Birds', keyword: 'Crow', hint: 'Problem solving feather flyer', difficulty: 'Medium' },
  { category: 'Animals', theme: 'Reptiles', keyword: 'Chameleon', hint: 'Masters of color camouflage', difficulty: 'Easy' },

  { category: 'Food', theme: 'Italian Delicacy', keyword: 'Neapolitan Pizza', hint: 'Wood-fired dough with mozzarella & basil', difficulty: 'Easy' },
  { category: 'Food', theme: 'Street Delights', keyword: 'Pani Puri', hint: 'Crispy sphere with spicy mint water', difficulty: 'Easy' },
  { category: 'Food', theme: 'Desserts', keyword: 'Gulab Jamun', hint: 'Golden fried milk balls soaked in rose syrup', difficulty: 'Easy' },
  { category: 'Food', theme: 'Japanese Cuisine', keyword: 'Sushi Roll', hint: 'Vinegared rice wrapped in seaweed', difficulty: 'Medium' },

  { category: 'Movies', theme: 'Sci-Fi Classics', keyword: 'Interstellar', hint: 'Black holes, wormholes and tesseract love', difficulty: 'Medium' },
  { category: 'Movies', theme: 'Epic Franchises', keyword: 'Baahubali', hint: 'Waterfalls, golden statues and kingdom warfare', difficulty: 'Easy' },
  { category: 'Movies', theme: 'Superhero Legends', keyword: 'The Dark Knight', hint: 'Gotham city vigilante facing chaos', difficulty: 'Easy' },
  { category: 'Movies', theme: 'Animated Wonders', keyword: 'Spirited Away', hint: 'Bathhouse for spirits and dragons', difficulty: 'Hard' },

  { category: 'Sports', theme: 'Cricket Fever', keyword: 'Super Over', hint: 'Six-ball tiebreaker thriller', difficulty: 'Medium' },
  { category: 'Sports', theme: 'Global Athletics', keyword: 'Olympic Marathon', hint: '26.2 miles of supreme human endurance', difficulty: 'Easy' },
  { category: 'Sports', theme: 'Combat Sports', keyword: 'Karate Black Belt', hint: 'High kicks, kata, and martial discipline', difficulty: 'Easy' },
  { category: 'Sports', theme: 'Racket Sports', keyword: 'Wimbledon Final', hint: 'White dress code on lush green grass', difficulty: 'Medium' },

  { category: 'Technology', theme: 'Modern AI', keyword: 'Neural Network', hint: 'Layers of synthetic synapses learning patterns', difficulty: 'Medium' },
  { category: 'Technology', theme: 'Computing Hardware', keyword: 'Quantum Processor', hint: 'Qubits utilizing superposition and entanglement', difficulty: 'Hard' },
  { category: 'Technology', theme: 'Smart Devices', keyword: 'Smartwatch', hint: 'Wrist companion tracking heartbeats and steps', difficulty: 'Easy' },
  { category: 'Technology', theme: 'Virtual Realms', keyword: 'VR Headset', hint: 'Immersive goggle display with spatial tracking', difficulty: 'Easy' },

  { category: 'Places', theme: 'Historical Wonders', keyword: 'Taj Mahal', hint: 'Ivory-white marble mausoleum on the Yamuna', difficulty: 'Easy' },
  { category: 'Places', theme: 'Natural Wonders', keyword: 'Grand Canyon', hint: 'Massive red rock gorges carved by a river', difficulty: 'Easy' },
  { category: 'Places', theme: 'Famous Cities', keyword: 'Tokyo', hint: 'Neon skyscrapers, shibuya crossing, anime & ramen', difficulty: 'Easy' },
  { category: 'Places', theme: 'Frozen Frontiers', keyword: 'Antarctica', hint: 'Sub-zero glaciers, penguins, and aurora polaris', difficulty: 'Medium' },

  { category: 'Professions', theme: 'Space Voyagers', keyword: 'Astronaut', hint: 'Spacewalker floating in zero gravity', difficulty: 'Easy' },
  { category: 'Professions', theme: 'Lifesavers', keyword: 'Neurosurgeon', hint: 'High-precision brain and spine operator', difficulty: 'Medium' },
  { category: 'Professions', theme: 'Creative Masters', keyword: 'Architect', hint: 'Blueprint designer crafting towering structures', difficulty: 'Easy' },
  { category: 'Professions', theme: 'Deep Explorers', keyword: 'Marine Biologist', hint: 'Studying coral reefs and oceanic ecosystems', difficulty: 'Medium' },

  { category: 'Nature', theme: 'Volcanic Power', keyword: 'Magma Eruption', hint: 'Molten rock bursting from earth core', difficulty: 'Easy' },
  { category: 'Nature', theme: 'Storm Phenomena', keyword: 'Tornado', hint: 'Violent rotating column of destructive wind', difficulty: 'Easy' },
  { category: 'Nature', theme: 'Sky Lights', keyword: 'Aurora Borealis', hint: 'Cosmic solar winds colliding with atmosphere', difficulty: 'Medium' },
  { category: 'Nature', theme: 'Forest Secrets', keyword: 'Redwood Giant', hint: 'Ancient thousand-year-old towering timber', difficulty: 'Easy' },

  { category: 'Objects', theme: 'Ancient Navigation', keyword: 'Magnetic Compass', hint: 'Needle pointing unerringly North', difficulty: 'Easy' },
  { category: 'Objects', theme: 'Timekeepers', keyword: 'Hourglass', hint: 'Grains of sand falling through narrow glass', difficulty: 'Easy' },
  { category: 'Objects', theme: 'Musical Instruments', keyword: 'Grand Piano', hint: 'Eighty-eight black and white acoustic keys', difficulty: 'Easy' },
  { category: 'Objects', theme: 'Optical Instruments', keyword: 'Hubble Telescope', hint: 'Cosmic eye observing distant nebulae', difficulty: 'Medium' },

  { category: 'Famous Characters', theme: 'Mythological Heroes', keyword: 'Hanuman', hint: 'Leaping across ocean carrying the Sanjeevani hill', difficulty: 'Easy' },
  { category: 'Famous Characters', theme: 'Deduction Masters', keyword: 'Sherlock Holmes', hint: 'Pipe, deerstalker cap, 221B Baker Street', difficulty: 'Easy' },
  { category: 'Famous Characters', theme: 'Fantasy Legends', keyword: 'Gandalf the Grey', hint: 'You shall not pass wizard with staff and sword', difficulty: 'Medium' },
  { category: 'Famous Characters', theme: 'Ancient Scholars', keyword: 'Aryabhata', hint: 'Pioneering astronomer who gifted zero to the world', difficulty: 'Medium' },

  { category: 'Science', theme: 'Subatomic World', keyword: 'Higgs Boson', hint: 'The God particle giving mass to universe', difficulty: 'Hard' },
  { category: 'Science', theme: 'Genetic Code', keyword: 'DNA Double Helix', hint: 'A-T and C-G twisted molecular ladder of life', difficulty: 'Easy' },
  { category: 'Science', theme: 'Astrophysics', keyword: 'Supernova', hint: 'Cataclysmic explosion of a dying giant star', difficulty: 'Medium' },
  { category: 'Science', theme: 'Chemistry', keyword: 'Graphene', hint: 'Single-atom-thick hexagonal carbon lattice', difficulty: 'Hard' },

  { category: 'Indian Culture', theme: 'Festivals of Lights', keyword: 'Diwali Clay Diya', hint: 'Glowing earthen lamp dispelling darkness', difficulty: 'Easy' },
  { category: 'Indian Culture', theme: 'Classical Dance', keyword: 'Kathakali', hint: 'Intricate facial makeup, eye gestures and mudras', difficulty: 'Medium' },
  { category: 'Indian Culture', theme: 'Ancient Architecture', keyword: 'Ellora Kailasa Temple', hint: 'Massive monolithic rock temple carved top-down', difficulty: 'Hard' },
  { category: 'Indian Culture', theme: 'Spiritual Heritage', keyword: 'Yoga & Meditation', hint: 'Asanas, pranayama, and inner stillness', difficulty: 'Easy' },

  { category: 'Vehicles', theme: 'High Speed Transit', keyword: 'Bullet Train (Shinkansen)', hint: 'Aerodynamic nose cruising at 320 km/h', difficulty: 'Easy' },
  { category: 'Vehicles', theme: 'Aerial Machines', keyword: 'Stealth Bomber', hint: 'Flying wing invisible to radar screens', difficulty: 'Medium' },
  { category: 'Vehicles', theme: 'Nautical Vessels', keyword: 'Nuclear Submarine', hint: 'Stealth vessel submerged for months in deep ocean', difficulty: 'Medium' },

  { category: 'School Life', theme: 'Classroom Memories', keyword: 'Surprise Test', hint: 'Terror strikes when teacher closes textbook', difficulty: 'Easy' },
  { category: 'School Life', theme: 'Cafeteria & Recess', keyword: 'Lunch Box Sharing', hint: 'Crowding around tiffin before the bell rings', difficulty: 'Easy' },
  { category: 'School Life', theme: 'Academic Panic', keyword: 'Last Night Cramming', hint: 'Coffee mugs and desperate chapter skimming', difficulty: 'Easy' },

  { category: 'Entertainment', theme: 'Retro Gaming', keyword: 'Pac-Man', hint: 'Yellow circle eating pellets while dodging ghosts', difficulty: 'Easy' },
  { category: 'Entertainment', theme: 'Theme Parks', keyword: 'Roller Coaster Loop', hint: 'Zero-g inversion with screaming passengers', difficulty: 'Easy' },
  { category: 'Entertainment', theme: 'Magic Shows', keyword: 'Levitation Illusion', hint: 'Defying gravity in front of bewildered eyes', difficulty: 'Medium' }
];

export const TEAM_METADATA = {
  prudhvi: {
    id: 'prudhvi',
    name: 'PRUDHVI',
    element: 'Earth',
    color: '#10b981',
    accent: '#34d399',
    description: 'Steadfast, resilient, and unyielding as ancient stone.',
    symbol: '??'
  },
  vayu: {
    id: 'vayu',
    name: 'VAYU',
    element: 'Air',
    color: '#06b6d4',
    accent: '#38bdf8',
    description: 'Swift, invisible, carrying whispers across the realm.',
    symbol: '??'
  },
  jal: {
    id: 'jal',
    name: 'JAL',
    element: 'Water',
    color: '#3b82f6',
    accent: '#60a5fa',
    description: 'Fluid, profound, and deceptive as the ocean abyss.',
    symbol: '??'
  },
  aakash: {
    id: 'aakash',
    name: 'AAKASH',
    element: 'Space / Cosmos',
    color: '#8b5cf6',
    accent: '#c084fc',
    description: 'Infinite, boundless, echoing across starlit voids.',
    symbol: '?'
  },
  agni: {
    id: 'agni',
    name: 'AGNI',
    element: 'Fire',
    color: '#ef4444',
    accent: '#f97316',
    description: 'Fierce, luminous, forging truth through intense heat.',
    symbol: '??'
  }
} as const;

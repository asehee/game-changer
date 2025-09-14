const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

const mockGames = [
  // Recommended Games
  {
    title: 'Cyber Warriors',
    description: 'Epic cyberpunk battle royale with stunning graphics and intense gameplay mechanics',
    genre: 'action',
    thumbnail: '/src/assets/game_images/shooting1.png',
    playerCount: 15234,
    totalPlayTime: 125000,
    rating: 4.8,
    price: 0.5,
    discount: 20,
    version: '1.0.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 360.0
  },
  {
    title: 'Space Odyssey',
    description: 'Explore infinite galaxies in this immersive space simulation adventure',
    genre: 'adventure',
    thumbnail: '/src/assets/game_images/shooting2.png',
    playerCount: 8923,
    totalPlayTime: 89000,
    rating: 4.6,
    price: 0.8,
    discount: 0,
    version: '1.2.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 480.0
  },
  {
    title: 'Fantasy Quest',
    description: 'Medieval RPG adventure with magical creatures and epic storylines',
    genre: 'rpg',
    thumbnail: '/src/assets/game_images/fantasy1.png',
    playerCount: 12456,
    totalPlayTime: 156000,
    rating: 4.9,
    price: 0.0,
    discount: 0,
    version: '2.1.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 0.0
  },
  {
    title: 'Racing Thunder',
    description: 'High-speed racing with blockchain rewards and competitive multiplayer',
    genre: 'racing',
    thumbnail: '/src/assets/game_images/shooting3.png',
    playerCount: 6789,
    totalPlayTime: 67000,
    rating: 4.4,
    price: 0.3,
    discount: 0,
    version: '1.5.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 200.0
  },

  // Top Games
  {
    title: 'Battle Arena',
    description: 'Competitive 5v5 MOBA with unique heroes and strategic gameplay',
    genre: 'strategy',
    thumbnail: '/src/assets/game_images/fantasy2.png',
    playerCount: 25678,
    totalPlayTime: 289000,
    rating: 4.7,
    price: 0.0,
    discount: 0,
    version: '3.0.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 0.0
  },
  {
    title: 'City Merge',
    description: 'Mind-bending puzzles that challenge your intellect and creativity',
    genre: 'puzzle',
    thumbnail: '/src/assets/game_images/kids1.png',
    playerCount: 9876,
    totalPlayTime: 45000,
    rating: 4.5,
    price: 0.2,
    discount: 0,
    version: '1.1.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 120.0
  },
  {
    title: 'Mystery Survival',
    description: 'Survive the apocalypse in this intense shooter with cooperative gameplay',
    genre: 'horror',
    thumbnail: '/src/assets/game_images/horror1.png',
    playerCount: 18234,
    totalPlayTime: 198000,
    rating: 4.6,
    price: 0.4,
    discount: 15,
    version: '1.8.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 300.0
  },
  {
    title: 'Puzzle Master',
    description: 'Create and manage your dream metropolis with advanced city planning',
    genre: 'simulation',
    thumbnail: '/src/assets/game_images/kids2.png',
    playerCount: 7654,
    totalPlayTime: 87000,
    rating: 4.3,
    price: 0.6,
    discount: 0,
    version: '2.0.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 400.0
  },

  // New Games
  {
    title: 'Neon Nights',
    description: 'Stylish action game set in neon-lit cyberpunk streets',
    genre: 'action',
    thumbnail: '/src/assets/game_images/shooting4.png',
    playerCount: 3456,
    totalPlayTime: 12000,
    rating: 4.4,
    price: 0.7,
    discount: 30,
    version: '0.9.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 420.0
  },
  {
    title: 'Dragon Explorer',
    description: 'Dive deep into mysterious underwater worlds and discover ancient secrets',
    genre: 'adventure',
    thumbnail: '/src/assets/game_images/fantasy3.png',
    playerCount: 2345,
    totalPlayTime: 8000,
    rating: 4.2,
    price: 0.5,
    discount: 0,
    version: '1.0.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 350.0
  },
  {
    title: 'Sky Pirates',
    description: 'Aerial combat with customizable airships and treasure hunting',
    genre: 'adventure',
    thumbnail: '/src/assets/game_images/fantasy4.png',
    playerCount: 4567,
    totalPlayTime: 15000,
    rating: 4.6,
    price: 0.9,
    discount: 0,
    version: '1.3.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 540.0
  },
  {
    title: 'Dungeon Crawler',
    description: 'Procedurally generated dungeons with epic loot and challenging bosses',
    genre: 'rpg',
    thumbnail: '/src/assets/game_images/horror2.png',
    playerCount: 5678,
    totalPlayTime: 23000,
    rating: 4.5,
    price: 0.4,
    discount: 0,
    version: '1.7.0',
    developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    ratePerSession: 280.0
  }
];

async function seedGames() {
  console.log('🌱 Starting game seeding process...');
  
  let successCount = 0;
  let failCount = 0;

  for (const game of mockGames) {
    try {
      console.log(`📤 Creating game: ${game.title}`);
      
      const response = await axios.post(`${API_BASE_URL}/games`, game);
      
      console.log(`✅ Successfully created: ${game.title} (ID: ${response.data.id})`);
      successCount++;
      
      // 요청 간 간격 추가 (API 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Failed to create ${game.title}:`, error.response?.data || error.message);
      failCount++;
    }
  }

  console.log(`\n🎮 Game seeding completed!`);
  console.log(`✅ Successfully created: ${successCount} games`);
  console.log(`❌ Failed to create: ${failCount} games`);
  
  if (successCount > 0) {
    console.log(`\n🌐 You can view all games at: ${API_BASE_URL}/games`);
    console.log(`📚 Swagger docs: http://localhost:3000/docs`);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedGames()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedGames, mockGames };
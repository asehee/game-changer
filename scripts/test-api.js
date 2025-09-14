const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Game API...\n');

  try {
    // 1. 단일 게임 생성 테스트
    console.log('1️⃣ Testing game creation...');
    const testGame = {
      title: 'API Test Game',
      description: 'Testing game creation via API',
      genre: 'action',
      thumbnail: '/test/image.png',
      playerCount: 1000,
      totalPlayTime: 5000,
      rating: 4.5,
      price: 0.3,
      discount: 10,
      version: '1.0.0',
      developerAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
      ratePerSession: 200.0
    };

    const createResponse = await axios.post(`${API_BASE_URL}/games`, testGame);
    console.log('✅ Game created successfully!');
    console.log(`📄 Game ID: ${createResponse.data.id}`);
    console.log(`🎮 Game Title: ${createResponse.data.title}`);
    console.log(`🎯 Genre: ${createResponse.data.genre}`);
    console.log(`💰 Price: $${createResponse.data.price}/hr`);

    // 2. 모든 게임 조회 테스트
    console.log('\n2️⃣ Testing game list retrieval...');
    const listResponse = await axios.get(`${API_BASE_URL}/games`);
    console.log(`✅ Found ${listResponse.data.length} games in database`);
    
    listResponse.data.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.title} (${game.genre}) - $${game.price}/hr`);
    });

    // 3. 장르별 게임 조회 테스트
    console.log('\n3️⃣ Testing genre-based filtering...');
    const genreResponse = await axios.get(`${API_BASE_URL}/games/genre/action`);
    console.log(`✅ Found ${genreResponse.data.length} action games`);
    
    genreResponse.data.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.title} - Rating: ${game.rating}`);
    });

    // 4. 특정 게임 조회 테스트
    console.log('\n4️⃣ Testing single game retrieval...');
    if (listResponse.data.length > 0) {
      const firstGameId = listResponse.data[0].id;
      const singleGameResponse = await axios.get(`${API_BASE_URL}/games/${firstGameId}`);
      console.log(`✅ Retrieved game: ${singleGameResponse.data.title}`);
      console.log(`   Description: ${singleGameResponse.data.description}`);
      console.log(`   Players: ${singleGameResponse.data.playerCount}`);
      console.log(`   Total Play Time: ${singleGameResponse.data.totalPlayTime} hours`);
    }

    console.log('\n🎉 All API tests completed successfully!');
    console.log(`\n🌐 You can view all data at:`);
    console.log(`   • All games: ${API_BASE_URL}/games`);
    console.log(`   • Action games: ${API_BASE_URL}/games/genre/action`);
    console.log(`   • Swagger docs: http://localhost:3000/docs`);

  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running:');
      console.error('   cd D:\\game-changer');
      console.error('   npm run start:dev');
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  try {
    // Test GET /api/campaigns
    console.log('\n📋 Testing GET /api/campaigns...');
    const response = await fetch('http://localhost:3001/api/campaigns');
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const campaigns = await response.json();
    console.log(`✅ API Response: Found ${campaigns.length} campaigns`);
    
    if (campaigns.length > 0) {
      console.log('\n📊 Sample campaigns:');
      campaigns.slice(0, 3).forEach((campaign, index) => {
        console.log(`${index + 1}. ${campaign.title} (${campaign.type})`);
        console.log(`   ID: ${campaign.id}`);
        console.log(`   Created: ${campaign.createdAt}`);
        if (campaign.type === 'fundraising') {
          console.log(`   Target: $${campaign.targetAmount}, Current: $${campaign.currentAmount}`);
        } else {
          console.log(`   Hospital: ${campaign.hospitalInfo?.name}`);
          console.log(`   Urgency: ${campaign.urgencyLevel}`);
        }
        console.log('');
      });
    } else {
      console.log('📭 No campaigns returned from API');
    }
    
    // Test individual campaign
    if (campaigns.length > 0) {
      const firstCampaign = campaigns[0];
      console.log(`\n🔍 Testing GET /api/campaigns/${firstCampaign.id}...`);
        } else {
          console.log(`❌ Failed: ${viewResponse.status} ${viewResponse.statusText}`);
        }
      }
    } else {
      console.log(`❌ Failed: ${campaignsResponse.status} ${campaignsResponse.statusText}`);
    }
    
    // Test 4: Get most visited campaigns
    console.log(`\n4️⃣ Testing GET /api/campaigns/most-visited`);
    const mostVisitedResponse = await fetch(`${baseUrl}/campaigns/most-visited`);
    
    if (mostVisitedResponse.ok) {
      const mostVisited = await mostVisitedResponse.json();
      console.log(`✅ Success: Found ${mostVisited.length} most visited campaigns`);
    } else {
      console.log(`❌ Failed: ${mostVisitedResponse.status} ${mostVisitedResponse.statusText}`);
    }
    
    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

testAPI();
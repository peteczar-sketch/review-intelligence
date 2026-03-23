<template>
  <div>
    <!-- Overall Result Container -->
    <div v-for="(result, index) in results" :key="index" class="result-container">
      
      <!-- Business Name -->
      <h2>{{ result.company }}</h2>
      
      <!-- Reliability & Score -->
      <div class="score-container">
        <span class="score" :style="getScoreStyle(result.reliabilityScore)">
          {{ result.reliabilityScore }}/100
        </span>
      </div>
      
      <!-- Source and Confidence Level -->
      <div class="source-confidence">
        <p v-if="result.reliabilityScore < 50" style="color: red;">High Risk</p>
        <p v-else-if="result.reliabilityScore < 80" style="color: orange;">Medium Risk</p>
        <p v-else style="color: green;">Low Risk</p>
        
        <!-- Display Sources (Google, Yelp, etc.) -->
        <p v-for="source in result.sources" :key="source.source">
          {{ source.source }}: ★{{ source.rating }} ({{ source.reviewCount }} reviews)
          <a :href="source.url" target="_blank">View source</a>
        </p>
      </div>
      
      <!-- Address and Website -->
      <p v-if="result.address">Address: {{ result.address }}</p>
      <p v-if="result.website">Website: <a :href="result.website" target="_blank">{{ result.website }}</a></p>
      
      <!-- Notes based on confidence or data availability -->
      <div v-if="result.confidence !== 'High'">
        <p style="color: #ffcc00;">Data available is limited, verify further if possible.</p>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      results: [
        {
          company: 'Oli Snow Removal Fabreville & Laval-Ouest',
          reliabilityScore: 55,
          sources: [
            { source: 'google', rating: 4.6, reviewCount: 583, url: 'https://google.com' }
          ],
          address: '651 Chemin St Antoine, Laval, QC H7R 6E7, Canada',
          website: null,
          confidence: 'Low', // You can set confidence levels based on evidence
        },
        // More results go here...
      ]
    };
  },
  methods: {
    getScoreStyle(score) {
      if (score >= 80) return { color: 'green' };
      if (score >= 50) return { color: 'orange' };
      return { color: 'red' };
    }
  }
};
</script>

<style scoped>
.result-container {
  margin: 20px;
  padding: 15px;
  background-color: #f1f1f1;
  border-radius: 10px;
}

.score-container {
  display: flex;
  align-items: center;
}

.score {
  font-size: 1.5em;
  font-weight: bold;
}

.source-confidence {
  margin-top: 10px;
}

a {
  text-decoration: none;
  color: blue;
}

a:hover {
  text-decoration: underline;
}
</style>

var CategoryCard = {
  /*html*/
  template: `
    <div 
      class="category-card" 
      :style="{ backgroundColor: category.bg, boxShadow: '0 0 5px ' + category.bg }"
      @click="$emit('category-clicked', category.id)"
    >
      <h1 class="category-title">{{ category.title }}</h1>
      <div class="category-skills">
        <div 
          class="skill" 
          v-for="skill in category.skills" 
          @click.stop="$emit('skill-clicked', category.id, skill.id)"
        >
          <img :src="skill.image">
        </div>
      </div>
    </div>
  `,
  props: ['category'],
  data: {},
  methods: {}
};

var CategoriesGrid = {
  /*html*/
  template: `
    <div class="categories">
      <category-card 
        v-for="category in categories" 
        :key="category.id"
        :category="category"
        @skill-clicked="onSkillClick"
        @category-clicked="onCategoryClick"
      ></category-card>
    </div>
  `,
  components: {
    'category-card': CategoryCard
  },
  props: ['categories'],
  data: {},
  methods: {
    onCategoryClick: function(categoryId) {
      console.log('cat: ', categoryId);
      this.$emit('open-category', categoryId);
    },

    onSkillClick: function(categoryId, skillId) {
      console.log('skill: ', categoryId, skillId);
      this.$emit('open-skill', categoryId, skillId);
    },
  }
}
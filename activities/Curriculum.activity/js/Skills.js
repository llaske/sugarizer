var SkillCard = {
  /*html*/
  template: `
    <div 
      class="skill"
    >
      <h1 class="skill-title">{{ skill.title }}</h1>
      {{skill}}
    </div>
  `,
  data: {},
  props: ['skill'],
  methods: {}
};

var SkillsGrid = {
  /*html*/
  template: `
    <div class="skills">
      <skill-card v-for="skill in skills" :key="skill.id" :skill="skill"></skill-card>
    </div>
  `,
  components: {
    'skill-card': SkillCard
  },
  props: ['categories', 'categoryId'],
  computed: {
    skills: function() {
      var vm = this;
      return this.categories.find(function(cat) {
        return cat.id == vm.categoryId;
      }).skills;
    }
  },
  data: {},
  methods: {}
}

var SkillDetails = {
  /*html*/
  template: `
    <div class="skill-details">
      <h1>Skill Details</h1>
      {{ skill }}
    </div>
  `,
  components: {
    'skill-card': SkillCard
  },
  props: ['categories', 'categoryId', 'skillId'],
  computed: {
    skill: function() {
      var vm = this;
      var skills = this.categories.find(function(cat) {
        return cat.id == vm.categoryId;
      }).skills;
      return skills.find(function(skill) {
        return skill.id == vm.skillId;
      });
    }
  },
  data: {},
  methods: {}
}
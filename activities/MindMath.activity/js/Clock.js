var Clock = {
  template: `
    <div class="detail-block">
      <div class="detail-logo clock-logo">
      </div>
      <div class="detail-content">
        <div class="clock">{{ currTime }}</div>
      </div>
    </div>
  `,
  data: function () {
    return {
      currTime: "1:02"
    };
  },
  mounted: function () {

  }
}

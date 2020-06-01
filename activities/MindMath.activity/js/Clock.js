var Clock = {
  template: `
    <div class="detail-block">
      <div class="detail-logo clock-logo">
      </div>
      <div class="detail-content">
        <button class="clock">{{ currTime }}</button>
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

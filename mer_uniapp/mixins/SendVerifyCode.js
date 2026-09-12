export default {
  data() {
    return {
      disabled: false,
      text: ''
    };
  },
  created() {
    if (!this.text) {
      this.text = this.$t ? this.$t('login.getCode') : '获取验证码';
    }
  },
  methods: {
    sendCode() {
      if (this.disabled) return;
      this.disabled = true;
      let n = 60;
      this.text = this.$t('login.remain', { n });
      const run = setInterval(() => {
        n = n - 1;
        if (n < 0) {
          clearInterval(run);
        }
        this.text = this.$t('login.remain', { n });
        if (n < 0) {
          this.disabled = false;
          this.text = this.$t('login.retry');
        }
      }, 1000);
    }
  }
};

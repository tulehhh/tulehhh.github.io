(() => {
  const button = document.querySelector('[data-copy-wechat]');
  const label = button?.querySelector('[data-copy-label]');
  const feedback = document.querySelector('[data-copy-feedback]');
  if (!button || !label || !feedback) return;

  const wechat = button.dataset.copyWechat?.trim();
  if (!wechat) return;

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    label.textContent = '复制中';
    feedback.textContent = '';

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(wechat);
      label.textContent = '已复制';
      feedback.textContent = '微信号已复制。';
    } catch {
      label.textContent = '重试';
      feedback.textContent = `未能自动复制，请手动选中微信号 ${wechat} 后复制。`;
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
})();

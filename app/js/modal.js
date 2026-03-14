// ===== MODAL MANAGER =====

const Modal = {
  _onConfirm: null,

  open(title, bodyHtml, footerHtml) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    // Focus first focusable element
    setTimeout(() => {
      const focusable = modal.querySelector('input, select, textarea, button, [tabindex]');
      if (focusable) focusable.focus();
    }, 100);
  },

  close() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    this._onConfirm = null;
  },

  confirm(title, message, onConfirm) {
    this._onConfirm = onConfirm;
    this.open(
      title,
      `<p>${Utils.escapeHtml(message)}</p>`,
      `<button class="btn btn-secondary" onclick="Modal.close()">취소</button>
       <button class="btn btn-primary" onclick="Modal._execConfirm()">확인</button>`
    );
  },

  _execConfirm() {
    if (typeof this._onConfirm === 'function') {
      this._onConfirm();
    }
    this.close();
  },

  init() {
    const modal = document.getElementById('modal');
    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.close();
      }
    });
    // Click backdrop to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });
  }
};

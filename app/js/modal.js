// ===== MODAL MANAGER =====

const Modal = {
  open(title, bodyHtml, footerHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '';
    document.getElementById('modal').classList.add('active');
  },

  close() {
    document.getElementById('modal').classList.remove('active');
  },

  confirm(title, message, onConfirm) {
    this.open(
      title,
      `<p>${message}</p>`,
      `<button class="btn btn-secondary" onclick="Modal.close()">취소</button>
       <button class="btn btn-primary" onclick="(${onConfirm.toString()})(); Modal.close();">확인</button>`
    );
  }
};

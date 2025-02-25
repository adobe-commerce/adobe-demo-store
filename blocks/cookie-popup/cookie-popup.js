function setConsentCookie(name, value, cookieSection) {
  localStorage.setItem(name, value);
  cookieSection.style.display = 'none';
}

function createCloseButton(cookieText) {
  const closeButton = document.createElement('a');
  closeButton.className = 'button';
  const closeButtonWrapper = document.createElement('div');
  closeButtonWrapper.className = 'button-container';
  closeButtonWrapper.append(closeButton);
  const cookieWrapper = document.querySelector('.cookie-popup-wrapper');
  cookieWrapper.setAttribute('tabindex', 0);
  closeButtonWrapper.addEventListener('click', () => setConsentCookie('cookie_consent_cookie_20231122350', 1, cookieWrapper));
  cookieText.parentNode.append(closeButtonWrapper);
}

function openLinkInNewTab(cookieText) {
  const a = cookieText.querySelector('div:first-child p a');
  if (a) {
    a.target = '_blank';
  }
}

export default async function decorate(block) {
  const domainName = String(window.location).split(window.location.pathname)[0];
  const cookiePopUpPath = `${domainName}/cookie-popup`;
  const resp = await fetch(`${cookiePopUpPath}.plain.html`);
  const html = await resp.text();
  const cookieText = block.querySelector('div');
  cookieText.innerHTML = html;
  createCloseButton(cookieText);
  openLinkInNewTab(cookieText);
}

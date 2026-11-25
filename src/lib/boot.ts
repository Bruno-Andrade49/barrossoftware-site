/**
 * Tela de carregamento (Boot): só na primeira visita da sessão, no site público e sem prefers-reduced-motion.
 * O script do <head> decide antes da primeira pintura e marca <html data-boot="run">; o CSS mostra a tela.
 * Se o JavaScript falhar, o próprio script libera a página em 8 s.
 */
export const BOOT_EVENT = "bs:boot-done";
export const BOOT_KEY = "bs_boot";

export const bootScript = `try{var d=document.documentElement;if(!/^\\/painel(\\/|$)/.test(location.pathname)&&!sessionStorage.getItem("${BOOT_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.boot="run";setTimeout(function(){if(d.dataset.boot){delete d.dataset.boot;dispatchEvent(new Event("${BOOT_EVENT}"))}},8000)}}catch(e){}`;

export const isBooting = () => typeof document !== "undefined" && document.documentElement.dataset.boot === "run";

/** Roda `cb` quando a tela de carregamento abre caminho (ou na hora, se ela não aparecer). */
export function whenBooted(cb: () => void) {
  if (!isBooting()) {
    cb();
    return () => {};
  }
  window.addEventListener(BOOT_EVENT, cb, { once: true });
  return () => window.removeEventListener(BOOT_EVENT, cb);
}

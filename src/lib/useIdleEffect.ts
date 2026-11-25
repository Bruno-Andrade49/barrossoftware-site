import { useEffect, type DependencyList } from "react";
import { ScrollTrigger } from "./motion";

/*
 * Animações das seções abaixo da dobra: em vez de montarem todas juntas logo depois da hidratação
 * (uma tarefa longa que trava a página), entram numa fila e montam uma por vez, quando o navegador
 * fica livre. A fila roda na ordem da página (os pins de cima são criados antes dos de baixo) e,
 * no fim, o ScrollTrigger recalcula as posições uma única vez.
 */
const queue: Array<() => void> = [];
let pending = false;

const later = (cb: () => void) =>
  typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback(cb, { timeout: 1000 })
    : window.setTimeout(cb, 16);

function pump() {
  const job = queue.shift();
  if (job) {
    job();
    later(pump);
    return;
  }
  pending = false;
  ScrollTrigger.refresh();
}

export function useIdleEffect(effect: () => void | (() => void), deps: DependencyList) {
  useEffect(() => {
    let alive = true;
    let cleanup: void | (() => void);
    queue.push(() => {
      if (alive) cleanup = effect();
    });
    if (!pending) {
      pending = true;
      later(pump);
    }
    return () => {
      alive = false;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as dependências vêm de quem chama
  }, deps);
}

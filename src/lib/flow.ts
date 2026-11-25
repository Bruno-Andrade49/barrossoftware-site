/**
 * Canal entre o palco de partículas e o hero. Fica fora do ParticleStage para o hero
 * não puxar o three.js no carregamento inicial (o palco é carregado depois, sob demanda).
 */
export type FlowStats = { x: number; y: number; agitation: number; fps: number };

export const flowBus = new EventTarget();
/** Última contagem anunciada (para quem se inscreve depois do anúncio). */
export const flowState = { count: 0 };

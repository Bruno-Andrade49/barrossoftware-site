import type { ProjectInput } from "../actions";

/** Projeto em branco para o formulário de novo projeto (módulo comum: roda no servidor e no navegador). */
export const emptyProject = (): ProjectInput => ({
  slug: "",
  name: "",
  client: "",
  type: "",
  year: String(new Date().getFullYear()),
  summary: "",
  description: "",
  challenge: "",
  solution: "",
  stack: [],
  results: [],
  url: "",
  video: { desktop: "", mobile: "" },
  poster: { desktop: "", mobile: "" },
  aspect: { desktop: "1600 / 912", mobile: "540 / 1150" },
  cover: "",
  gallery: [],
  published: false,
});

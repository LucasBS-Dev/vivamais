import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  PreferenciasPortal,
  FormularioPreferencias,
} from "./PreferenciasPortal";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("salva a preferência confirmada pelo serviço e aplica o tamanho do texto", async () => {
  const consulta = vi
    .fn()
    .mockResolvedValue(
      Response.json({ textoAmpliado: true, tamanhoPagina: 20, versao: 1 }),
    );
  vi.stubGlobal("fetch", consulta);
  const { container } = render(
    <PreferenciasPortal
      iniciais={{ textoAmpliado: false, tamanhoPagina: 20, versao: 0 }}
    >
      <FormularioPreferencias />
    </PreferenciasPortal>,
  );
  fireEvent.click(screen.getByLabelText("Ampliar os textos do portal"));
  await waitFor(() =>
    expect(container.firstElementChild?.classList.contains("texto-ampliado")).toBe(true),
  );
  expect(JSON.parse(consulta.mock.calls[0][1].body)).toEqual({
    textoAmpliado: true,
    tamanhoPagina: 20,
    versao: 0,
  });
});
it("falha não confirma salvamento e permite reler após conflito", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          { detail: "Preferências alteradas em outro acesso." },
          { status: 409 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({ textoAmpliado: true, tamanhoPagina: 10, versao: 2 }),
      ),
  );
  const { container } = render(
    <PreferenciasPortal
      iniciais={{ textoAmpliado: false, tamanhoPagina: 20, versao: 0 }}
    >
      <FormularioPreferencias />
    </PreferenciasPortal>,
  );
  fireEvent.click(screen.getByLabelText("Ampliar os textos do portal"));
  expect(await screen.findByRole("alert")).toHaveTextContent("outro acesso");
  expect(container.firstElementChild?.classList.contains("texto-ampliado")).toBe(false);
  fireEvent.click(
    screen.getByRole("button", { name: "Atualizar preferências" }),
  );
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  expect(screen.getByLabelText("Registros por página na ficha")).toHaveValue(
    "10",
  );
});
